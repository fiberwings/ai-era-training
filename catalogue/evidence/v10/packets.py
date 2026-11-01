import json,pathlib,re,sys
P=pathlib.Path(__file__).resolve().parent
inv=json.loads((P/'inventory.json').read_text())
for c in inv:
    n=c['reviewNumber']
    if not int(sys.argv[1])<=n<=int(sys.argv[2]):continue
    t=(P/'sources'/f'{n:03d}.txt').read_text()
    # Discard only navigation, repeated sales text, and lesson media labels.
    starts=[t.find(x) for x in ["What you'll learn","What you’ll learn","Why Enroll","About this course"] if x in t]
    a=t[min(starts):] if starts else t
    a=a.split('Elevate your learning')[0].split('\nInstructors\n')[0]
    about=a.find('About this course')
    detail=a.find('In detail,')
    if 0<=about<detail:a=a[:about]+a[detail:]
    lines=[x for x in a.splitlines() if x not in ['Video','・','・Quiz','Reading','Graded','Code Example','Video with Code Example','PRO','・Code Assignment'] and not re.fullmatch(r'(\d+[hm])+(\d+[sm])?|\d+|Lessons・|Code Examples',x)]
    print(f'### {n} {c["name"]}\n'+ '\n'.join(lines)+'\n')
