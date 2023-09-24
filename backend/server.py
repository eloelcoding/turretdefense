from fastapi import FastAPI, HTTPException
from fastapi.staticfiles import StaticFiles
from starlette.responses import FileResponse

import uvicorn
from database import Database, Map

app = FastAPI()

URL = 'sqlite:///backend/data/maps.db'
db = Database(URL)
db.create_table()


# Save a map to the database
@app.post("/api/map")
def save_map(map_data: Map):
    db = Database(URL)
    db.save_map(map_data)
    return {"message": "Map saved successfully"}

# Load a map from the database by name
@app.get("/api/map/{name}")
def read_map(name: str):
    db = Database(URL)
    encoded_map = db.load_map(name)
    if encoded_map:
        return {"encodedMap": encoded_map}
    else:
        raise HTTPException(status_code=404, detail="Map not found")


@app.delete("/api/map/{name}")
def delete_map(name: str):
    deleted = db.delete_map(name)
    if deleted:
        return {"message": "Map deleted successfully"}
    else:
        raise HTTPException(status_code=404, detail="Map not found")

# List all map names
@app.get("/api/maps")
def list_maps():
    db = Database(URL)
    map_names = db.get_map_names()
    return {"mapNames": map_names}

# Serve the index.html file as the default page
@app.get("/")
async def get_index():
    return FileResponse("docs/index.html")

# Serve static files from the "docs" directory
app.mount("/", StaticFiles(directory="docs"), name="static")



# Run the server
if __name__ == "__main__":
    port = 3000
    uvicorn.run("server:app", reload = True, host="0.0.0.0", port=port)
