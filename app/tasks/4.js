// Степенной метод и метод Якоби

var math = require("mathjs");
var utils = require("../utils");

var EPS = 0.00001;

var powerMethod = function(matrix) {
  var y_k = math.ones([matrix.length]);
  var y_k1 = math.zeros([matrix.length]);
  for (var i = 0; i < matrix.length; i++) {
    for (var j = 0; j < matrix.length; j++) {
      y_k1[i] += matrix[i][j] * y_k[j];
    }
  }

  var l_k = y_k1[0] / y_k[0];
  var l_k1 = l_k;

  do {
    l_k = l_k1;
    y_k = math.clone(y_k1);
    y_k1 = math.zeros([matrix.length]);

    for (var i = 0; i < matrix.length; i++) {
      for (var j = 0; j < matrix.length; j++) {
        y_k1[i] += matrix[i][j] * y_k[j];
      }
    }

    l_k1 = y_k1[0] / y_k[0];
  } while(math.abs(l_k - l_k1) > EPS);

  return l_k1;
}

// поиск максимального по модулю внедиагонального элемента
var findAbsMaxElementIdxs = function(matrix) {
  var maxElement = {
    value: 0,
    i: -1,
    j: -1
  }
  for (var i = 0; i < matrix.length; i++) {
    for (var j = 0; j < matrix.length; j++) {
      if ((i != j) && (math.abs(matrix[i][j]) > maxElement.value)) {
        maxElement = {
          value: math.abs(matrix[i][j]),
          i: i,
          j: j
        };
      }
    }
  }
  return maxElement;
}

var converge = function(matrixA_k1, matrixA_k) {
  for(var i = 0; i < matrixA_k1.length; i++) {
    if(math.abs(matrixA_k[i][i] - matrixA_k1[i][i]) >= EPS) {
      return false;
    }
  }
  return true;
}

var yakobiMethod = function(matrix) {
  var matrixA_k = math.matrix([matrix.length, matrix.length]);
  var matrixA_k1 = math.clone(matrix);

  do {
    matrixA_k = math.clone(matrixA_k1);
    // ищем максимальный по модулю внедиагональный элемент
    maxEl = findAbsMaxElementIdxs(matrixA_k);

    // считаем угол поворота
    var phi = 0.5 * math.atan(2 * matrixA_k[maxEl.i][maxEl.j] / (matrixA_k[maxEl.i][maxEl.i] - matrixA_k[maxEl.j][maxEl.j]));
    var s = math.sin(phi);
    var c = math.cos(phi);

    // пересчитываем значения элементов матрицы A_k1
    matrixA_k1[maxEl.i][maxEl.j] = 0;
    matrixA_k1[maxEl.j][maxEl.i] = 0;

    matrixA_k1[maxEl.i][maxEl.i] = c * c * matrixA_k[maxEl.i][maxEl.i] + 2 * c * s * matrixA_k[maxEl.i][maxEl.j] + s * s * matrixA_k[maxEl.j][maxEl.j];
    matrixA_k1[maxEl.j][maxEl.j] = s * s * matrixA_k[maxEl.i][maxEl.i] - 2 * c * s * matrixA_k[maxEl.i][maxEl.j] + c * c * matrixA_k[maxEl.j][maxEl.j];

    for(var i = 0; i < matrix.length; i++) {
      for(var j = 0; j < matrix.length; j++) {
        if((i != maxEl.i) && (i != maxEl.j) && (j != maxEl.i) && (j != maxEl.j)) {
          matrixA_k1[i][j] = matrixA_k[i][j];
        }
        if((j == maxEl.i) && (i != maxEl.i) && (i != maxEl.j)) {
          matrixA_k1[i][maxEl.i] = c * matrixA_k[i][maxEl.i] + s * matrixA_k[i][maxEl.j];
          matrixA_k1[maxEl.i][i] = c * matrixA_k[i][maxEl.i] + s * matrixA_k[i][maxEl.j];
        }
        if((j == maxEl.j) && (i != maxEl.i) && (i != maxEl.j)) {
          matrixA_k1[i][maxEl.j] = (-s) * matrixA_k[i][maxEl.i] + c * matrixA_k[i][maxEl.j];
          matrixA_k1[maxEl.j][i] = (-s) * matrixA_k[i][maxEl.i] + c * matrixA_k[i][maxEl.j];
        }
      }
    }

    // utils.printMatrix(matrixA_k1);

  } while(!converge(matrixA_k1, matrixA_k));

  return matrixA_k1;
}

var modifiedYakobiMethod = function(matrix) {
  var matrixA_k = math.matrix([matrix.length, matrix.length]);
  var matrixA_k1 = math.clone(matrix);

  do {
    matrixA_k = math.clone(matrixA_k1);
    // ищем максимальный по модулю внедиагональный элемент
    maxEl = findAbsMaxElementIdxs(matrixA_k);

    // считаем угол поворота
    var phi = math.atan(2 * matrixA_k[maxEl.i][maxEl.j] / (matrixA_k[maxEl.i][maxEl.i] - matrixA_k[maxEl.j][maxEl.j])) / 2;

    // 1 на главной диагонали, остальные нули
    var matrixU = math.eye([matrix.length]);

    // пересчитываем значения элементов матрицы U
    matrixU[maxEl.i][maxEl.j] = 0 - math.sin(phi);
    matrixU[maxEl.j][maxEl.i] = math.sin(phi);
    matrixU[maxEl.i][maxEl.i] = math.cos(phi);
    matrixU[maxEl.j][maxEl.j] = math.cos(phi);

    // транспонируем матрицу U
    matrixU_t = math.transpose(matrixU);
    
    // считаем A_k1 = U_t * A_K * U
    matrixA_k1 = math.multiply(math.multiply(matrixU_t, matrixA_k), matrixU);
    // utils.printMatrix(matrixA_k1);

  } while(!converge(matrixA_k1, matrixA_k));

  return matrixA_k1;
}

var solve = function() {
  console.log("★★★ Степенной метод и метод Якоби ★★★\n");

  var matrix = [
    [ 1.8832, -1.5564, -0.3245],
    [-1.5564,  1.9911, -0.2518],
    [-0.3245, -0.2518,  0.9738]
  ];

  console.log("## Исходная матрица [A]");
  utils.printMatrix(matrix, 10);

  console.log("----------------------------------------\n");

  console.log("## Степенной метод");
  var maxLambda = powerMethod(matrix);
  console.log("Макисмальное значение \\lambda: " + maxLambda);

  console.log("\n----------------------------------------\n");

  console.log("## Метод Якоби");
  var resultMatrix = yakobiMethod(matrix);
  utils.printMatrix(resultMatrix);

  console.log("\n----------------------------------------\n");

  console.log("## Модифицированный метод Якоби");
  resultMatrix = modifiedYakobiMethod(matrix);
  utils.printMatrix(resultMatrix);

}

exports.solve = solve;
