from fastapi import FastAPI, HTTPException
from fastapi.staticfiles import StaticFiles
from starlette.responses import FileResponse

import uvicorn

app = FastAPI()

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
