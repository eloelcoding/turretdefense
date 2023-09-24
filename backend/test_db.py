import os
import random
import unittest
import math, uuid
from unittest import TestCase
from unittest.mock import patch, MagicMock
from sqlalchemy import create_engine
from pandas import DataFrame

from backend.database import Database, Map



class TestDatabase(TestCase):
    def setUp(self):
        self.file = f"/tmp/maps-{uuid.uuid4()}.db"
        self.db : Database = Database(f'sqlite:///{self.file}')
        self.db.create_table(drop=True)

    def random_map(self):
        random_name = f"Map-{math.floor(100*random.random())}"
        random_value = f"Random-{math.floor(100*random.random())}"
        map = Map(name= random_name, encodedMap= random_value)
        self.db.save_map(map)
        return map 

    def test_create(self):
        maps = self.db.get_map_names()
        self.assertEqual(0,len(maps))

    def test_add_item(self):
        added_map = self.random_map()
        self.db.save_map(added_map)
        map = self.db.load_map(added_map.name)
        self.assertEqual(map, added_map.encodedMap)
    
    def test_count_maps(self):
        maps = self.db.get_map_names()
        self.assertEqual(0,len(maps))
        added_map = self.random_map()
        self.db.save_map(added_map)
        maps = self.db.get_map_names()
        self.assertEqual(1,len(maps))

    def test_delete_maps(self):
        added_map = self.random_map()
        self.db.save_map(added_map)
        self.db.delete_map(added_map.name)
        maps = self.db.get_map_names()
        self.assertEqual(0,len(maps))
        with self.assertRaises(LookupError):
            self.db.load_map(added_map.name)

    def tearDown(self):
        del(self.db)
        os.remove(self.file)

if __name__ == '__main__':
    unittest.main()