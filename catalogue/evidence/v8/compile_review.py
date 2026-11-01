"""Compile explicit analyst decisions. No keyword-based score assignment."""
import json, pathlib, collections, hashlib
R=pathlib.Path(__file__).resolve().parent
D=json.loads((R/'original.json').read_text())
offers={r[0]:r for r in D['Offers'][1:]}
reqs={r[0]:r for r in D['Rubric'][1:] if r[8]=='Active'}
needs={r[0]:r for r in D['Needs'][1:] if r[6]=='Active'}
prior={(r[0],r[2]):r for r in D['Scores'][1:] if r[0]}
oldcov={(r[0],r[2]):r for r in D['Coverage'][1:] if r[0]}
dec=json.loads((R/'decisions.json').read_text())
for filename in ['review-external.tsv','review-internal.tsv','review-corrections.tsv']:
    for line in (R/filename).read_text().splitlines():
        if not line.strip():continue
        oid,values,note=line.split('\t')
        d=dec.setdefault(oid,{'scores':{},'note':''})
        d['scores'].update({k:int(v) for k,v in (s.split('=') for s in values.split() if '=' in s)})
        d['note']=(' '.join([d['note'],note])).strip()
        if values=='UNASSESSED':d['unassessed']=True
assert set(dec)==set(offers)
for d in dec.values():assert set(d['scores'])<=set(reqs)
exams={'TR-008','TR-018','TR-019','TR-020','TR-023','TR-031','TR-037','TR-050'}
practice={'INT-646','INT-2754'}
for oid in exams:
    dec[oid]['scores']={q:0 for q in reqs}
    dec[oid]['note']='Teaching-coverage correction: this record is an exam or credential, with optional preparation sold separately. Exam objectives demonstrate assessment scope, not taught coverage. V7 objective-based scores are preserved in the Prior score column; they are not counted as course teaching. Select a separately assessed preparation course when planning learning.'
levels=['Base','Entry','Practitioner','Expert']
records=[];coverage=[];audits=[]
for oid,o in offers.items():
    d=dec[oid];unassessed=d.get('unassessed',False)
    sources=o[24] or o[18] or ''
    if oid=='INT-1099':
        sources+='\nhttps://www.udemy.com/course/claude-banking/'
        d['note']+=' Public banking-course synopsis recovered at the canonical provider URL; its June version differs from the enterprise September description, so duration and access metadata were retained.'
    source=sources.splitlines()[0] if sources else ''
    basis=('Unassessed — authoritative syllabus unavailable' if unassessed else
           'Exam objectives only — no taught course credit' if oid in exams else
           'Practice test — no taught course credit' if oid in practice else
           'Announced syllabus — delivery not verified' if oid=='TR-035' else
           'Public provider/source desk review — syllabus evidence, not course completion')
    oscores={};counts=collections.Counter()
    for q,r in reqs.items():
        p=prior.get((oid,q));old=p[5] if p else None
        score=None if unassessed else d['scores'].get(q,old if old is not None else 0)
        change=('Unassessed' if score is None else 'New explicit zero' if not p and score==0 else
                'New positive assessment' if not p else 'Changed score' if score!=old else 'Retained score')
        counts[change]+=1;oscores[q]=score
        if score is None:evidence='No sufficiently authoritative course content was accessible. Left blank, not assessed as zero. '+d['note']
        elif oid in exams:
            evidence=dec[oid]['note']
            if p and p[6]:evidence+=' V7 objective evidence (not taught coverage): '+p[6]
        elif p and score==old:evidence=(p[6] or '')+' [V8: retained after source/rubric review.]'
        elif q in d['scores']:
            evidence=f'V8 requirement review — {r[5]}: '+d['note']
            if p and p[6]:evidence+=' V7 evidence (superseded score): '+p[6]
        else:evidence='No teaching or explicit mention of this requirement evidenced in the reviewed public course synopsis/source. Zero describes this evidence review, not proof that no such training exists.'
        records.append({'offer':oid,'title':o[2],'req':q,'need':r[1],'requirement':r[5],
                        'score':score,'evidence':evidence,'rank':r[10],'core':r[4] or '',
                        'status':'Unassessed' if score is None else 'Assessed','prior':old,
                        'source':source,'change':change})
    cs=[]
    for n,nrow in needs.items():
        rr=[r for r in reqs.values() if r[1]==n]
        prev=oldcov.get((oid,n))
        rank=levels.index(prev[4]) if prev else max(levels.index(o[13]),min(r[10] for r in rr))
        # Do not hide newly evidenced Practitioner/Expert teaching in foundation needs.
        rank=max([rank]+[r[10] for r in rr if (oscores[r[0]] or 0)>=2])
        scope=[r for r in rr if r[10]<=rank]
        vals=[oscores[r[0]] for r in scope]
        total=sum(v or 0 for v in vals);pct=total/(3*len(scope))
        core=sum(r[4]=='Yes' for r in scope)
        gaps=sum(r[4]=='Yes' and not oscores[r[0]] for r in scope)
        at3=vals.count(3);scored=sum(v is not None for v in vals)
        band=('Unassessed' if scored==0 else 'Full' if at3==len(scope) else 'Strong' if pct>=.7 and gaps==0 else 'Partial' if pct>=.3 else 'Weak')
        note='All 140 requirements reviewed; this row uses the stated target-level scope. Scores contains higher-level requirements too.'
        if unassessed:note='Unassessed. Percentage is zero for gap arithmetic only; no numeric teaching scores have been invented.'
        elif oid in exams:note='Exam-only record: zero taught coverage. Prior objective mappings retained in Scores; see V8 audit.'
        elif all((v or 0)==0 for v in vals):note='No coverage evidenced in the reviewed public material for this need. This is not a claim that no training exists.'
        if prev and prev[4]!=levels[rank]:note+=f' Target expanded from {prev[4]} to include newly evidenced higher-level teaching.'
        c={'offer':oid,'title':o[2],'need':n,'name':nrow[1],'level':levels[rank],'rank':rank,'scope':len(scope),
           'scored':scored,'pct':pct,'core':core,'gaps':gaps,'at3':at3,'band':band,'note':note}
        coverage.append(c);cs.append(c)
    positive=[c for c in cs if c['pct']>0]
    summary='; '.join(f"{c['need']} {c['band']} {c['pct']:.0%}" for c in positive) or ('Unassessed — source unavailable' if unassessed else 'No taught coverage evidenced')
    audits.append({'offer':oid,'title':o[2],'basis':basis,'assessed':sum(v is not None for v in oscores.values()),
                   'positive':sum((v or 0)>0 for v in oscores.values()),'newpositive':counts['New positive assessment'],
                   'changed':counts['Changed score'],'newzero':counts['New explicit zero'],'retained':counts['Retained score'],
                   'fullstrong':sum(c['band'] in ['Full','Strong'] for c in cs),'summary':summary,
                   'positive_needs':', '.join(c['need'] for c in positive),
                   'note':d['note'],'sources':sources,'old_fit':o[23], 'old_summary':o[21]})
assert len(records)==43120 and len(coverage)==7084
stats=dict(collections.Counter(r['change'] for r in records))
stats.update(offers=len(offers),requirements=len(reqs),needs=len(needs),score_rows=len(records),coverage_rows=len(coverage),
             numeric_assessments=sum(r['score'] is not None for r in records),
             offers_with_changed_scores=sum(a['changed']>0 for a in audits),
             offers_with_new_positive_scores=sum(a['newpositive']>0 for a in audits),
             fullstrong=sum(c['band'] in ['Full','Strong'] for c in coverage),
             original_sha256=hashlib.sha256((R.parent/'AI_Era_Cyber_Training_Catalogue_v7.xlsx').read_bytes()).hexdigest())
model={'records':records,'coverage':coverage,'audits':audits,'stats':stats}
(R/'compiled.json').write_text(json.dumps(model,ensure_ascii=False))
print(json.dumps(stats,indent=2))
print('INT-154 N3:',next(c for c in coverage if c['offer']=='INT-154' and c['need']=='N3'))
