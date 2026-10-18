import json
from pathlib import Path
from PIL import ImageFont

ROOT = Path('/Users/cyberk/projects/ai-era-training')
data = json.loads((ROOT/'training-planner/public/data/catalogue.json').read_text())
needs = {n['id']: n for n in data['needs']}
fonts = {}
def font(size, bold):
    key=(size,bold)
    if key not in fonts:
        fonts[key]=ImageFont.truetype('/System/Library/Fonts/Supplemental/Arial'+(' Bold' if bold else '')+'.ttf',size)
    return fonts[key]
def wrap(text,width,size,bold=False):
    lines=[]
    for para in text.split('\n'):
        line=''
        for word in para.split():
            trial=(line+' '+word).strip()
            if line and font(size,bold).getlength(trial)>width:
                lines.append(line);line=word
            else:line=trial
        lines.append(line)
    return '\n'.join(lines)

colors={'ink':'#162D43','muted':'#526577','base':'#245695','pract':'#8B530F','expert':'#6A3D8D'}
slides=[]
def text(slide,value,x,y,w,size=24,bold=False,color='ink',line=None):
    rendered=wrap(value,w,size,bold)
    h=len(rendered.split('\n'))*(line or size*1.18)+2
    slide['shapes'].append(dict(text=rendered,x=x,y=y,w=w,h=h,size=size,bold=bold,color=colors.get(color,color)))
    return h
def new(title,subtitle,num):
    s={'shapes':[],'notes':'','ids':[]}
    text(s,title,64,44,2272,48,True)
    text(s,subtitle,64,110,2272,25,color='muted')
    text(s,f'{num} / 2',2250,1290,86,20,color='muted')
    slides.append(s)
    return s

labels={
 'R1.1':'Agent incident response', 'R1.2':'AI forensics and agent traces',
 'R3.1':'Red-team the bank’s agents', 'R3.2':'Contain testing agents and validate findings',
 'R4.1':'Manage the agent tool estate as an exposure class',
 'R4.2':'Build and validate AI code-analysis harnesses',
 'R5.1':'Design the agent control plane', 'R6.1':'Assure agents',
 'R9.1':'Run the agent identity lifecycle'}
scopes={'N1':'Base: all staff','N2':'Base: all staff','N3':'Base: all staff',
 'N4':'Base, with Practitioner addition [P]','N5':'Base, with Expert addition [E]',
 'N6':'Entry (L1)','N7':'Practitioner (L2)','N8':'Practitioner (L2)','N9':'Practitioner (L2)',
 'N10':'Expert (L3)','N11':'Expert (L3)','N12':'Expert; N12.9 for architects',
 'N13':'Expert: GRC, BISOs and leaders','N14':'Expert: leaders and champions',
 'R1.1':'Practitioner','R1.2':'Expert','R3.1':'Practitioner [P] and Expert [E]',
 'R3.2':'Practitioner','R4.1':'Practitioner','R4.2':'Expert','R5.1':'Expert',
 'R6.1':'Expert','R9.1':'Practitioner [P] and Expert [E]'}
def block(s,nid,x,y,w,color):
    title=labels.get(nid,needs[nid]['title'])
    y+=text(s,nid+'  '+title,x,y,w,27,True,color)
    if nid.startswith('R') or nid in ['N4','N5','N6','N12','N13','N14']:
        y+=text(s,scopes[nid],x,y+2,w,20,color='muted')+7
    else:y+=9
    for r in [r for r in data['requirements'] if r['need']==nid]:
        title=r['title']
        if r['id']=='N4.7':title+=' [P]'
        if r['id']=='N5.7':title+=' [E]'
        if r['id']=='N12.9':title+=' [architects]'
        if r['id'] in ['N14.6','N14.7']:title+=' [leaders]'
        if nid in ['R3.1','R9.1']:title+=' [P]' if r['level']=='Practitioner' else ' [E]'
        h=text(s,r['id']+'  '+title,x,y,w,23,line=27)
        y+=h+1
        s['ids'].append(r['id'])
    return y+20

s=new('Shared AI capabilities by audience',
 '14 needs and 90 sub-needs. Higher levels build on earlier learning. Expert scope follows the person’s role.',1)
columns=[('ALL STAFF (BASE)',['N1','N2','N3'],'base'),
 ('ALL STAFF AND ENTRY',['N4','N5','N6'],'base'),
 ('PRACTITIONER (L2)',['N7','N8','N9'],'pract'),
 ('EXPERT (L3)',['N10','N11','N12'],'expert'),
 ('EXPERT AND LEADERS',['N13','N14'],'expert')]
for i,(title,ns,c) in enumerate(columns):
    x=64+i*461
    text(s,title,x,174,427,25,True,c)
    y=224
    for nid in ns:y=block(s,nid,x,y,427,c)
    print('slide1',i,'bottom',y)
    if y>1260:raise ValueError('Slide 1 column overflow')
text(s,'[P] Practitioner addition   [E] Expert addition   Specific role labels take precedence. All IDs refer to the catalogue rubric.',64,1290,2100,20,color='muted')

s=new('Specialist capabilities by responsibility',
 '9 role extras and 50 sub-needs. Apply only the branches relevant to the person’s responsibilities.',2)
columns=[('CYBER DEFENCE CENTRE',['R1.1','R1.2']),
 ('APPLICATION SECURITY: TESTING',['R3.1','R3.2']),
 ('APPLICATION SECURITY: EXPOSURE',['R4.1','R4.2']),
 ('ARCHITECTURE AND ASSURANCE',['R5.1','R6.1']),
 ('IDENTITY AND ACCESS',['R9.1'])]
for i,(title,ns) in enumerate(columns):
    x=64+i*461
    text(s,title,x,174,427,25,True,'base')
    y=254
    for nid in ns:y=block(s,nid,x,y,427,'ink')
    print('slide2',i,'bottom',y)
    if y>1190:raise ValueError('Slide 2 column overflow')
text(s,'Function mapping: architecture sits in Application Security; assurance sits in BISO. IDP uses N4, N7–N9 and N13; CIO uses N11, N13 and N14.',64,1210,2272,23,color='muted')
text(s,'The source defines no extra need for threat intelligence/detection, awareness or leadership. [P] Practitioner   [E] Expert. Shared needs and tool practice still apply.',64,1250,2272,23,color='muted')

for s in slides:
    subset=[r for r in data['requirements'] if r['id'] in s['ids']]
    s['notes']='Sources: Agentic-Era_Workforce_Capability_Model.md (Draft v1); AI_Era_Cyber_Training_Catalogue_v7.xlsx, Needs and Rubric sheets. Workbook snapshot '+data['version']+'.\n\n'
    s['notes']+='Audience labels show the source model’s level. Functional mappings are planning proposals. Requirement IDs and short titles remain traceable to the rubric.\n\n'
    for r in subset:
        s['notes']+=f"{r['id']} {r['title']} [{r['level']}]\n{r['description']}\nSource: Rubric row {r['source']['row']}\n\n"
assert len(slides[0]['ids'])==90 and len(slides[1]['ids'])==50
assert len(set(slides[0]['ids']+slides[1]['ids']))==140
(ROOT/'.presentation-build/needs-map/layout.json').write_text(json.dumps(slides,ensure_ascii=False))
