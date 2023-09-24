async function fetchApi(url, method="GET", data) {
  var options = { method }
  if (method == "POST")
    options = {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(data)
    }
  const response = await fetch(url, options);
  const output = await response.json();
  return output;
}

class MapSaver {
  static async loadMap(mapName) {
    mapName = mapName || prompt("Enter map name:");
    if (mapName) {
      try {
        const data = await fetchApi(`/api/map/${mapName}`);
        return data;
      } catch (error) {
        console.error(error);
        return null;
      }
    }
    return null;
  }

  static async listMaps() {
    var data = await fetchApi('/api/maps');
    return data.mapNames;
  }

  static async saveMap(name, encodedMap) {
    const data = {name,encodedMap};
    const result = await fetchApi('/api/map', "POST", data)
    console.log(result);
  }

  static async deleteMap(mapName) {
    const results = await fetchApi(`/api/map/${mapName}`,"DELETE");
    console.log(results);
  }
}