import copy
from pathlib import Path
import sys
import unittest
ROOT=Path(__file__).resolve().parents[1]
sys.path.insert(0,str(ROOT/'scripts'))
from catalogue_io import PROPOSED_HEADERS,read_proposed_training,validate_proposed_rows,validate_snapshot
from test_refresh import fixture


def row():
    return ['Workshop','Trainer',None,'Proposed','First line\nSecond line','N1.1','N1.1 · Description','Foundation','Foundation',0,'','','','Plan','Draft','item-id','foundation','plan-id']


class ProposedTrainingTests(unittest.TestCase):
    def test_optional_catalogue_proposals_are_separate_from_courses_and_scores(self):
        data=fixture();before=copy.deepcopy(data)
        data['proposedTraining']={'formatVersion':1,'columns':PROPOSED_HEADERS,'rows':[row()]}
        validate_snapshot(data)
        self.assertEqual(data['courses'],before['courses'])
        self.assertEqual(data['requirements'],before['requirements'])
        other=copy.deepcopy(row());other[16]='l1'
        validate_proposed_rows([row(),other])
        with self.assertRaisesRegex(ValueError,'Duplicate'):validate_proposed_rows([row(),row()])

    def test_read_preserves_unknown_zero_and_multiline_text(self):
        values=row();values[1]=None
        zero=row();zero[2]=0;zero[15]='zero-hours'
        class Sheet:
            def iter_rows(self,values_only=True):return iter([PROPOSED_HEADERS,values,zero,[None]*18])
        result=read_proposed_training({'Proposed training':Sheet()})
        self.assertEqual(result['rows'][0][2],None)
        self.assertEqual(result['rows'][1][2],0)
        self.assertEqual(result['rows'][0][1],'')
        self.assertEqual(result['rows'][0][4],'First line\nSecond line')

    def test_invalid_schema_status_hours_and_original_ids_fail_import(self):
        for index,value in [(2,-1),(2,'Unknown'),(2,True),(9,4),(3,'Done'),(15,''),(17,'')]:
            invalid=row();invalid[index]=value
            with self.assertRaises(ValueError):validate_proposed_rows([invalid])
        data=fixture();data['proposedTraining']={'formatVersion':2,'columns':PROPOSED_HEADERS,'rows':[]}
        with self.assertRaisesRegex(ValueError,'format'):validate_snapshot(data)


if __name__=='__main__':unittest.main()
