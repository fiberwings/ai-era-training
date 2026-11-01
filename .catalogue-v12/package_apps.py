"""Refresh existing application distribution ZIPs without touching analysis packs."""
from pathlib import Path
from zipfile import ZipFile,ZIP_DEFLATED
R=Path(__file__).resolve().parent.parent
with ZipFile(R/'outputs/Training-Planner.zip','w',ZIP_DEFLATED) as z:
    z.write(R/'training-planner/Training-Planner.html','Training-Planner.html')
p=R/'outputs/Training-Planner-Windows-Update-Kit.zip'
with ZipFile(p) as z:instructions=z.read('WINDOWS-UPDATE-INSTRUCTIONS.txt').decode()
instructions=instructions.replace('AI_Era_Cyber_Training_Catalogue_v11.xlsx','AI_Era_Cyber_Training_Catalogue_v12.xlsx')
with ZipFile(p,'w',ZIP_DEFLATED) as z:
    z.writestr('WINDOWS-UPDATE-INSTRUCTIONS.txt',instructions)
    files=[R/'training-planner/requirements.txt',R/'training-planner/README.md',R/'training-planner/server.py']
    files += list((R/'training-planner/scripts').glob('*.py'))+list((R/'training-planner/scripts').glob('*.mjs'))
    files += [f for f in (R/'training-planner/public').rglob('*') if f.is_file()]
    for f in files:z.write(f,str(f.relative_to(R)))
print('Updated existing planner application ZIPs')
