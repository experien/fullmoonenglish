g_articles = [];
g_page = 0;


function getElm(id) {
  return document.getElementById(id);
}


function getVal(id) {
  return document.getElementById(id).value;
}


function setVal(id, value) {
  document.getElementById(id).value = value;
}


/* ============== page movements ==============*/
function viewPage() {
  if (g_articles.length > 0) {
    getElm("inputText").value = g_articles[g_page];
  }
  getElm("pages").innerText = (g_page+1) + " / " + g_articles.length;
}


function firstPage() {
  g_page = 0;
  viewPage();
}


function lastPage() {
  if (g_articles.length > 0) {
    g_page = g_articles.length - 1;
    viewPage();
  }
}


function nextPage() {
  if (g_articles.length > 0 && g_page < g_articles.length-1) {
    g_page++;
    viewPage();
  }
}


function prevPage() {
  if (g_articles.length > 0 && g_page > 0) {
    g_page--;
    viewPage();
  }
}


/* ============== generator subfunctions ==============*/
function shuffle(a) {
  // Fisher–Yates shuffle algorithm
  var j, x, i;
  for (i = a.length - 1; i > 0; i--) {
      j = Math.floor(Math.random() * (i + 1));
      x = a[i];
      a[i] = a[j];
      a[j] = x;
  }
  return a;
}


function splitStc(srcText) {
  //ret = srcText.split(/(?<=[\.\?\!]\S?)(\s|$)/g).filter(x => x!="" && x!=" ");
  ret = srcText.match(/[\w\(\"].*?[\.!\?][\)\"]?(?=\s*)/g);
  console.log(ret);
  return ret;
}


function selectionStr(arr) {
  // 배열 원소들에 1) 2) 3) ... 선택지를 붙인다. arr 변형됨.
  for (var i = 0; i < arr.length; i++) {
    arr[i] = (i+1) + ") " + arr[i];
  }
  return arr.join("\n");
}


function partition3(arr) {
  // 3으로 똑 자른다.
  var pSize = Math.floor(arr.length / 3);
  var rem = arr.length % 3;
  var p1 = pSize;
  var p2 = pSize;

  // 나머지는 첫번째, 두번째 파티션에 랜덤하게 더한다.
  while (rem > 0) {
    if (Math.random() > 0.5) {
      p1++;
    } else {
      p2++;
    }
    rem--;
  }
  res = [arr.slice(0, p1), arr.slice(p1, p1+p2), arr.slice(p1+p2)];
  return res.map(x=>x.join(" "))
}


/* ============== generator functions ==============*/
function genStcOrder(srcText) {
  // 지문 분할
  var stcArr = splitStc(srcText);
  if (!stcArr || stcArr.length < 3) {
    return "At least 3 sentences are required.";
  }

  var pArr = partition3(stcArr);

  // 각 파티션 앞에 A, B, C 를 붙이고 섞는다 (rightOrder=원래 순서=정답)
  rightOrder = shuffle(["(A)", "(B)", "(C)"]);
  console.log("answer = " + rightOrder);
  for (var i = 0; i < pArr.length; i++) {
    pArr[i] = rightOrder[i] + " " + pArr[i];
  }
  pArr.sort();

  // 선택지 만들기
  orders = [rightOrder.join("-"), "", "", ""];
  for (var i = 1; i < orders.length; i++) {
    while (orders.includes((order = shuffle(["(A)", "(B)", "(C)"]).join("-"))));
    orders[i] = order;
  }
  shuffle(orders);

  return [pArr.join(" "), "다음 중 적절한 순서는?", selectionStr(orders)].join("\n\n");
}


function genStcInsert(srcText) {
  var stcArr = splitStc(srcText);
  if (!stcArr || stcArr.length <= 1) {
    return "At least 2 sentences are required.";
  }

  var alpha = Array.from("ABCDEFGHIJKLMNOPQRSTUVWXYZ").slice(0, stcArr.length);
  alpha = alpha.map(x => "("+x+")");

  var popidx = Math.floor(Math.random() * stcArr.length);
  var missingStc = stcArr.splice(popidx, 1);
  console.log("answer = " + alpha[popidx]);

  for (var i = 0; i < stcArr.length; i++) {
    stcArr[i] = alpha[i] + " " + stcArr[i];
  }

  var article = stcArr.join(" ") + " " + alpha[alpha.length-1];
  var selections = selectionStr(alpha);
  return [article, "다음 문장이 들어가기에 알맞은 곳은?", missingStc, selections].join("\n\n");
}


function genStcTopic(srcText) {
  var stcArr = splitStc(srcText);
  if (!stcArr || stcArr.length <= 1) {
    return "At least 2 sentences are required.";
  }

  var alpha = Array.from("ABCDEFGHIJKLMNOPQRSTUVWXYZ").slice(0, stcArr.length);
  alpha = alpha.map(x => "("+x+")");
  for (var i = 0; i < stcArr.length; i++) {
    stcArr[i] = alpha[i] + " " + stcArr[i];
  }

  var article = stcArr.join(" ");
  var selections = selectionStr(alpha);
  console.log("answer = ?");
  return [article, "위 지문에서 주제문으로 적절한 문장은?", selections].join("\n\n");
}


/* ============== main functions ==============*/
function splitArticles() {
  txt = getVal("inputText");
  if (!txt)
    return;

  g_articles = txt.split(/\n\s*\n+/g).filter(x => x!="" && x!=" ");
  firstPage();
}


function generate() {
  var genFuncs = {
    "stcOrder": genStcOrder,
    "stcInsert": genStcInsert,
    "stcTopic": genStcTopic
  };

  setVal("tmpOutputText", genFuncs[getVal("pbType")](getVal("inputText")));
}


function append() {
  var txt = "\n\n" + getVal("tmpOutputText") + "\n";
  getElm("outputText").appendChild(document.createTextNode(txt));
}


function copyToClipboard() {
  getElm("outputText").select();
  document.execCommand("copy");
  alert("Copied the text: " + getVal("outputText").substring(0, 20) + "...");
}
