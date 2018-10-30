// generators and subfunctions

// Fisher–Yates shuffle algorithm
function shuffle(a) {
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
  ret = srcText.split(/(?<=[\.\?\!]\S?)(\s|$)/g).filter(x => x!=" ");
  //console.log(ret);
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


function genStcOrder(srcText) {
  // 지문 분할
  var stcArr = splitStc(srcText);
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


function genNoop(srcText) {
  return "Not implemented";
}


// main functions
function generate() {
  var srcText = document.getElementById("inputText").value;
  var pbType = document.getElementById("pbType").value;
  var dstElm = document.getElementById("outputText");

  var genFuncs = {
    "wrdBlank":genNoop,
    "stcOrder":genStcOrder,
    "stcInsert":genStcInsert
  };
  dstElm.value = genFuncs[pbType](srcText);
}


function copyToClipboard() {
  var srcElm = document.getElementById("outputText");

  srcElm.select();
  document.execCommand('Copy');
  var repr = (srcElm.value.length <= 20) ? srcElm.value : (srcElm.value.substring(0, 20) + "...");
  alert("Copied: " + repr);
}
