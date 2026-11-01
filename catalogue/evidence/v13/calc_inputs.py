"""Compact dependency model for changed results; untouched totals are input controls."""
from update import *
parts=load(W/'uncached.xlsx');ss=strings(parts)
def rows(sn):
    return [(int(row.get('r')),{re.sub(r'\d','',c.get('r')):value(c,ss) for c in row}) for row in tree(parts,sn).find(T('sheetData')) if row.get('r')!='1']
rubrows=rows(4);rub={r['A']:(rn,r) for rn,r in rubrows if r.get('A')}
titles={r['A']:r['C'] for rn,r in rows(10) if r.get('A')}
needs={r['A']:r['B'] for rn,r in rows(3) if r.get('A')}
targets={'TR-014','TR-015','TR-023','TR-280'}
inputs=[];others=defaultdict(list);newlookups=[];other_numeric=0
for rn,r in rows(5):
    if not r.get('A'):continue
    rr=rub[r['C']][1]
    if r['A'] in targets and rr['I']=='Active':
        inputs.append([r['A'],r['C'],rr['B'],rr['K'],int(rr.get('E')=='Yes'),r.get('F')])
    else:
        if isinstance(r.get('F'),(int,float)):others[r['C']].append(r['F']);other_numeric+=1
    if rn>=57953:
        for col,v in {'B':titles[r['A']],'D':rr['B'],'E':rr['F'],'J':rr['K'],'K':'Yes' if rr.get('E')=='Yes' else '', 'L':rr['I']}.items():newlookups.append([5,f'{col}{rn}',v])
end=len(inputs)+1
ir=lambda c:f"'Inputs'!${c}$2:${c}${end}"
rdata=[];rforms=[];rindex={};results=newlookups
for i,(rn,r) in enumerate(rubrows,2):
    if not r.get('A'):continue
    vals=others[r['A']];rindex[r['A']]=i
    rdata.append([r['A'],r['B'],r['I'],max(vals,default=0),vals.count(3),vals.count(2)])
    rforms.append([f'=MAX(D{i},_xlfn.MAXIFS({ir("F")},{ir("B")},A{i}))',f'=E{i}+COUNTIFS({ir("B")},A{i},{ir("F")},3)',f'=F{i}+COUNTIFS({ir("B")},A{i},{ir("F")},2)'])
    for col,cc in [('L','G'),('M','H'),('N','I')]:results.append([4,f'{col}{rn}',f"='Rubric'!{cc}{i}"])
rend=len(rdata)+1;rrange=lambda c:f"'Rubric'!${c}$2:${c}${rend}"
cdata=[];cforms=[];other_bands=defaultdict(Counter)
for rn,r in rows(6):
    if r.get('A') not in targets:
        other_bands[r.get('C')][r.get('M')]+=1;continue
    rank=['Base','Entry','Practitioner','Expert'].index(r['E']);rs=[x for _,x in rubrows if x.get('B')==r['C'] and x.get('I')=='Active' and x['K']<=rank]
    i=len(cdata)+2
    cdata.append([r['A'],r['C'],rank,len(rs),sum(x.get('E')=='Yes' for x in rs)])
    criteria=f'{ir("A")},A{i},{ir("C")},B{i},{ir("D")},"<="&C{i}'
    cforms.append([f'=COUNTIFS({criteria})',f'=SUMIFS({ir("F")},{criteria})',f'=IF(D{i}=0,"",G{i}/(3*D{i}))',f'=E{i}-COUNTIFS({criteria},{ir("E")},1,{ir("F")},">=1")',f'=COUNTIFS({criteria},{ir("F")},3)',f'=IF(F{i}=0,"Unassessed",IF(J{i}=D{i},"Full",IF(AND(H{i}>=0.7,I{i}=0),"Strong",IF(H{i}>=0.3,"Partial","Weak"))))'])
    for col,v in {'B':titles[r['A']],'D':needs[r['C']],'F':f"='Coverage'!C{i}",'G':f"='Coverage'!D{i}",'H':f"='Coverage'!F{i}",'I':f"='Coverage'!H{i}",'J':f"='Coverage'!E{i}",'K':f"='Coverage'!I{i}",'L':f"='Coverage'!J{i}",'M':f"='Coverage'!K{i}"}.items():results.append([6,f'{col}{rn}',v])
cend=len(cdata)+1;crange=lambda c:f"'Coverage'!${c}$2:${c}${cend}"
ndata=[];nforms=[]
for i,(rn,r) in enumerate(rows(3),2):
    nid=r['A'];c=other_bands[nid];ndata.append([nid,c['Full']+c['Strong'],c['Partial']])
    nforms.append([f'=COUNTIFS({rrange("B")},A{i},{rrange("C")},"Active",{rrange("G")},3)',f'=COUNTIFS({rrange("B")},A{i},{rrange("C")},"Active",{rrange("G")},"<2")',f'=B{i}+COUNTIFS({crange("B")},A{i},{crange("K")},"Full")+COUNTIFS({crange("B")},A{i},{crange("K")},"Strong")',f'=C{i}+COUNTIFS({crange("B")},A{i},{crange("K")},"Partial")'])
    for col,cc in [('K','D'),('L','E'),('M','F'),('N','G')]:results.append([3,f'{col}{rn}',f"='Needs'!{cc}{i}"])
for addr,formula in {
 'B37':'=411+1',
 'B67':f'=COUNTIFS({rrange("C")},"Active",{rrange("G")},3)',
 'B68':f'=COUNTIFS({rrange("C")},"Active",{rrange("G")},"<2")',
 'B69':f'={other_numeric}+COUNT({ir("F")})',
 'B70':f'={sum(sum(c.values()) for c in other_bands.values())}+COUNTA({crange("K")})',
 'B71':f'={sum(c["Full"]+c["Strong"] for c in other_bands.values())}+COUNTIF({crange("K")},"Full")+COUNTIF({crange("K")},"Strong")'
}.items():results.append([1,addr,formula])
payload={'inputs':inputs,'rubric':rdata,'rubricFormulas':rforms,'coverage':cdata,'coverageFormulas':cforms,'needs':ndata,'needFormulas':nforms,'results':results}
(W/'calc-inputs.json').write_text(json.dumps(payload)+'\n')
(P/'calculation-cells.json').write_text(json.dumps({str(sn):[addr for s,addr,v in results if s==sn] for sn in {s for s,a,v in results}})+'\n')
print('Compact model:',len(inputs),'changed-course outcomes;',len(results),'affected results; unchanged totals kept as controls.')
