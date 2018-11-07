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
function shuffle(arr) {
  // Fisher–Yates shuffle algorithm
  var j, x, i;
  for (i = arr.length - 1; i > 0; i--) {
      j = Math.floor(Math.random() * (i + 1));
      x = arr[i];
      arr[i] = arr[j];
      arr[j] = x;
  }
  return arr;
}


function randomChoice(arr, n) {
  if (arr.length < n)
    n = arr.length;

  indices = []
  for(var i = 0; i < n; i++) {
    do {
      r = Math.floor(Math.random() * arr.length);
    } while (indices.includes(r));
    indices.push(r);
  }

  return indices.map(x => arr[x]);
}


function splitStc(srcText) {
  ret = srcText.match(/[\w\(\"].*?[\.!\?][\)\"]?(?=\s*)/g);
  //console.log("sentences = " + ret);
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


function nonstopWords(srcText) {
  return srcText.toLowerCase().match(/\w+/g).filter(x => !stopWords.includes(x));
}


function allIndexOf(str, srcText) {
  var re = new RegExp(str, "gi");
  var m = srcText;
  var ret = [];
  while ((m = re.exec(srcText)) != null) {
    ret.push(m.index);
  }
  //console.log("allindex = " + ret);
  return ret;
}


function wrdCount(wrdArr, n) {
  // stop words 를 제외하고 가장 많이 나온 단어 n개를 구한다(소문자로 통일).
  // 참고: NLP, RAKE alg., JS구현: https://github.com/Ismael-Hery/rake-keywords

  // 빈도 계산
  var counter = [];
  var prev = "";
  var cnt = 0;
  wrdArr.sort();
  for (key in wrdArr) {
    cur = wrdArr[key];
    if (cur == prev) {
      cnt++;
    } else {
      counter.push({ kw:prev, cnt:cnt });
      prev = cur;
      cnt = 1;
    }
  }
  counter.push({ kw:prev, cnt:cnt });
  counter.sort((a, b) => b.cnt - a.cnt); // 내림차순
  //console.log(counter.map(x => x.kw));
  return counter;
}


function replaceAt (srcText, index, target, replacement) {
    return srcText.substr(0, index) + replacement + srcText.substr(index + target.length);
}


/* ============== generator functions ==============*/
function genBlkKeyword(srcText) {
  var numCands = 3;

  if (!srcText) {
    return "";
  }

  // 키워드를 뽑는다.
  var wrdArr = nonstopWords(srcText);
  if (!wrdArr || wrdArr.length < numCands)
    return "Too few words";

  var counter = wrdCount(wrdArr, numCands);
  if (counter.length < numCands)
    return "Too few words";

    // 가장 많이 나온 단어 3개 중 하나를 고른다.
  var cands = counter.slice(0, numCands).map(x => x.kw);
  keyword = randomChoice(cands, 1)[0];
  console.log("candidates = " + cands);
  console.log("answer = " + keyword);

  // srcText 안의 keyword 중 무작위 하나를 빈칸으로 변경
  var indices = randomChoice(allIndexOf(keyword, srcText), 2);
  article = replaceAt(srcText, indices[0], keyword, "______");
  if (indices.length >= 2) {
    article = replaceAt(article, indices[1], keyword, "______");
  }

  var selections = [keyword].concat(randomChoice(counter.map(x=>x.kw).filter(x=>x!=keyword), 3));

  return [article, "다음 중 빈 칸(______)에 들어갈 단어는?", selectionStr(selections)].join("\n\n");
}


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
    "Blank keyword": genBlkKeyword,
    "Sentence order": genStcOrder,
    "Missing sentence": genStcInsert,
    "Topic sentence": genStcTopic
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
