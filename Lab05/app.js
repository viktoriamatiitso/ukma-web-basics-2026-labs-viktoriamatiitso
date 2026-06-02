// ============================================================
// Завдання 1 — API Explorer (міні-Postman)
// ============================================================
// Вимоги:
//   1. Form → fetch: метод, URL, headers, body.
//      GET/HEAD без body (інакше TypeError).
//   2. Парсинг headers з textarea:
//      "Content-Type: application/json" → { "Content-Type": "application/json" }
//      Порожні рядки і "# коментар" — ігнорувати.
//   3. Валідація JSON body перед fetch.
//   4. Відображення response:
//      - Статус-код з кольоровим маркером (2xx/3xx/4xx/5xx).
//      - Response headers (всі).
//      - Тіло: JSON форматувати, text/html — як є.
//      - Час виконання (performance.now()).
//   5. AbortController при повторному кліку.
//   6. Історія останніх 10: метод + URL + status.
//      Клік → форма заповнюється цими значеннями.
//
// Тестові URL:
//   GET  https://httpbin.org/get
//   GET  https://httpbin.org/status/404
//   GET  https://httpbin.org/status/500
//   GET  https://httpbin.org/delay/3
//   POST https://jsonplaceholder.typicode.com/posts
//        body: { "title": "test", "body": "body", "userId": 1 }
// ============================================================

const methodSel = document.getElementById("method");
const urlInput = document.getElementById("url");
const sendBtn = document.getElementById("send");
const headersTA = document.getElementById("headers");
const bodyTA = document.getElementById("body");
const bodyErr = document.getElementById("body-error");

const responseDiv = document.getElementById("response");
const statusLine = document.getElementById("status-line");
const responseHeaders = document.getElementById("response-headers");
const responseBody = document.getElementById("response-body");

const historyEl = document.getElementById("history");

let currentController = null;
const historyData = []; // { method, url, status, headers, body }

// TODO: реалізуйте всю логіку

sendBtn.addEventListener("click", async () => {
  if(currentController !== null){
    currentController.abort();
  }
  currentController = new AbortController();

  const method = methodSel.value;
  let url = urlInput.value.trim();
  if(url === ""){
    url = urlInput.placeholder;
  }

  const headersObj = {};
  const headerLines = headersTA.value.split("\n");
  for(let i = 0; i< headerLines.length; i++){
    let line = headerLines[i].trim();

    if(line === "" || line.startsWith("#")){
        continue;
    }

    const colonIdx = line.indexOf(":");
    if(colonIdx !== -1){
        const key = line.slice(0, colonIdx).trim();
        const value = line.slice(colonIdx+1).trim();
        headersObj[key] = value;
    }
  }

  let bodyData = null;
  bodyErr.hidden = true;
  if(method === "POST" || method === "PUT" || method === "PATCH" || method === "DELETE"){
    let rawText = bodyTA.value.trim();
    if(rawText !== ""){
        try{
            JSON.parse(rawText);
            bodyData = rawText;
        }catch(error){
            bodyErr.textContent = "Невалідний JSON: " + error.message;
            bodyErr.hidden = false;
            return; 
        }
    }
  }

  const fetchOptions = {
    method: method,
    headers: headersObj,
    signal: currentController.signal
  };
  if(bodyData !== null && method != "GET" && method !== "HEAD"){
    fetchOptions.body = bodyData;
  }

  sendBtn.disabled = true;
  sendBtn.textContent = "Sending...";
  responseDiv.classList.remove("visible");
  const startTime = performance.now();

  try{
    const response = await fetch(url, fetchOptions);
    const endTime = performance.now();
    const timeTaken = Math.round(endTime - startTime);

    const firstDigit = String(response.status)[0];
    statusLine.className = `status-line s${firstDigit}`;
    statusLine.textContent = `${response.status} ${response.statusText}`;

    const timeSpan = document.createElement("span");
    timeSpan.className = "elapsed"; 
    timeSpan.textContent = `${timeTaken} ms`; 
    statusLine.appendChild(timeSpan);

    const resHeaders = {};
    for(const [key, value] of response.headers.entries()){
        resHeaders[key] = value;
    }
    responseHeaders.textContent = JSON.stringify(resHeaders, null, 2);

    const contentType = response.headers.get("content-type") || "";
    if(contentType.includes("application/json")){
        const data = await response.json();
        responseBody.textContent = JSON.stringify(data, null, 2);
    }else if (contentType.includes("text") || contentType.includes("html")){
        const text = await response.text();
        responseBody.textContent = text;
    }else{
        await response.blob();
        responseBody.textContent = "[binary content]";
    }
    saveToHistory(method, url, response.status);    
  }catch (error){
    const endTime = performance.now();
    const timeTaken = Math.round(endTime - startTime);

    if(error.name === "AbortError"){
        statusLine.className = "status-line s4";
        statusLine.textContent = "Скасовано ";
        responseBody.textContent = "Запит було перервано новим кліком";
    }else{
        statusLine.className = "status-line s5";
        statusLine.textContent = "Помилка серверу ";
        responseBody.textContent = error.message;
        saveToHistory(method, url, "Err");
    }
    const timeSpan = document.createElement("span");
    timeSpan.className = "elapsed";
    timeSpan.textContent = `${timeTaken} ms`;
    statusLine.appendChild(timeSpan);
    responseHeaders.textContent = "";
  }finally{
    responseDiv.classList.add("visible");
    sendBtn.disabled = false;
    sendBtn.textContent = "Send";
    currentController = null;
  }
});

function saveToHistory(method, url, status){
    const currentHeaders = headersTA.value;
    const currentBody = bodyTA.value;
    historyData.unshift({method, url, status, headers: currentHeaders, body: currentBody});
    if(historyData.length > 10){
        historyData.pop();
    }
    renderHistory();
}

function renderHistory(){
    historyEl.innerHTML = "";

    for(let i = 0; i< historyData.length; i++){
        const item = historyData[i];
        const li = document.createElement("li");

        let color = "#c33";
        if(item.status >= 200 && item.status < 300){
            color ="#2a8a4a";
        }else if (item.status >= 300 && item.status < 400){
            color = "#2050a0";
        }else if (item.status >= 400 && item.status < 500){
            color = "#b85c00";
        }

        const methodSpan = document.createElement("span");
        methodSpan.className = "method";
        methodSpan.textContent = item.method;

        const urlText = document.createTextNode(` ${item.url} `);

        const statusSpan = document.createElement("span");
        statusSpan.className = "status";
        statusSpan.style.color = color;
        statusSpan.textContent = item.status;

        li.appendChild(methodSpan);
        li.appendChild(urlText);
        li.appendChild(statusSpan);

        li.addEventListener("click", () =>{
            methodSel.value = item.method;
            urlInput.value = item.url;
            headersTA.value = item.headers;
            bodyTA.value = item.body;
            bodyErr.hidden = true;
        });
        historyEl.appendChild(li);
    }
}