from sqlalchemy import create_engine, text
from sqlalchemy.engine.base import Engine
import pandas as pd
from typing import Optional
from pydantic import BaseModel

VERBOSE = False

# Define a model for the map data
class Map(BaseModel):
    encodedMap: str
    name: str

class Database:
    def __init__(self, url):
        self.url = url
        self.engine: Optional[Engine] = None

    def get_connection(self) -> Engine:
        if not self.engine:
            self.engine = create_engine(self.url)
        return self.engine

    def __del__(self):
        if self.engine is not None:
            self.engine.dispose()

    def query(self, query: str, params = None) -> pd.DataFrame:
        if params is None:
            params = {} 
        if VERBOSE:
            print(f"Running query [{query}] with params = {params}")
            print(query, params)
        engine = self.get_connection()
        return pd.read_sql(query, engine, params=params)
    
    def execute_query(self, query, params = None):
        if params is None:
            params = {} 
        if VERBOSE:
            print(f"Executing query [{query}] with params = {params}")
        engine = self.get_connection()
        conn = engine.connect()
        conn.execute(text(query), params)
        conn.commit()

    def create_table(self, drop = False) -> None:
        if VERBOSE:
            print("Creating database if necessary")
        if drop:
            self.execute_query("DROP TABLE IF EXISTS maps")
        create_query = "CREATE TABLE IF NOT EXISTS maps (encoded_map TEXT, name TEXT PRIMARY KEY)"
        self.execute_query(create_query)

    def save_map(self, map_data: Map) -> None:
        query = "INSERT OR REPLACE INTO maps (encoded_map, name) VALUES (:encodedMap,:name)"
        self.execute_query(query, map_data.__dict__)

    def delete_map(self, name: str) -> None:
        query = "DELETE FROM maps WHERE name = :name"
        self.execute_query(query, {'name': name})
        return True

    def load_map(self, name) -> str | None:
        results = self.query(f"SELECT encoded_map FROM maps WHERE name=:name", {'name': name})
        if len(results):
            return results.loc[0,'encoded_map']
        else:
            raise LookupError("Could not load map")

    def get_map_names(self) -> list[str]:
        results = self.query("SELECT name FROM maps")
        return list(results['name'])

if __name__ == "__main__":
    url = 'sqlite:///backend/data/maps2.db'
    db = Database(url)
    print(db.create_table())
    print(db.get_map_names())
    print(db.load_map('map1'))