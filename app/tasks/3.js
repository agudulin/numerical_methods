// Метод простых итераций

var math = require("mathjs");
var utils = require("../utils");

var EPS = 0.00001;

var yakobiMethod = function(matrixA, vectorB) {
  var x_k = [1, 1, 1];
  var x_k1 = [0, 0, 0];

  var iterationsCount = 0;
  while (!converge(x_k1, x_k)) {
    ++iterationsCount;
    x_k = math.clone(x_k1);
    for (var i = 0; i < matrixA.length; i++) {
      var tmpSum = 0;
      for (var j = 0; j < matrixA.length; j++) {
        if (i != j) {
          tmpSum += matrixA[i][j] * x_k[j];
        }
      }
      x_k1[i] = (vectorB[i] - tmpSum) / matrixA[i][i];
    }
  }

  return {
    vectorX: x_k1,
    iterations: iterationsCount
  }
}

var nekrasovMethod = function(matrixA, vectorB) {
  // текущее решение
  var x_k = [-1, -1, -1];
  // предыдущее решение
  var x_k_prev = [0, 0, 0];

  var iterationsCount = 0;
  while (!converge(x_k_prev, x_k)) {
    ++iterationsCount;
    x_k_prev = math.clone(x_k);
    for (var i = 0; i < matrixA.length; i++) {
      var tmpSum = 0;
      for (var j = 0; j < i; j++) {
        tmpSum += matrixA[i][j] * x_k[j];
      }
      for (var j = i+1; j < matrixA.length; j++) {
        tmpSum += matrixA[i][j] * x_k_prev[j];
      }
      x_k[i] = (vectorB[i] - tmpSum) / matrixA[i][i];
    }
  }

  return {
    vectorX: x_k,
    iterations: iterationsCount
  }
}

var converge = function(x_k1, x_k) {
  for(var i = 0; i < x_k1.length; i++) {
    if(math.abs(x_k1[i] - x_k[i]) >= EPS) {
      return false;
    }
  }
  return true;
}

var solve = function() {
  console.log("★★★ Метод простых итераций ★★★\n");

  var matrix = [
    [ 10.646128, 1.2778591, -3.2868475],
    [ 1.2778591, 8.0844645,  0.76474173],
    [-3.2868475, 0.76474173, 6.4147487]
  ];

  var vector = [16.3944, 1.179528, -8.733536];

  console.log("## Исходная матрица [A]");
  utils.printMatrix(matrix, 10);
  console.log("## Исходный вектор [b]");
  utils.printMatrix(vector, 10);

  console.log("----------------------------------------\n");
  
  console.log("## Метод простых итераций");
  var result = yakobiMethod(matrix, vector);
  console.log("-- Количество итераций: " + result.iterations);
  utils.printMatrix(result.vectorX, 10);
  
  console.log("## Проверка [A * x = b]");
  utils.printMatrix(math.multiply(matrix, result.vectorX), 10);

  console.log("----------------------------------------\n");

  console.log("## Метод Некрасова");
  result = nekrasovMethod(matrix, vector);
  console.log("-- Количество итераций: " + result.iterations);
  utils.printMatrix(result.vectorX, 10);
  
  console.log("## Проверка [A * x = b]");
  utils.printMatrix(math.multiply(matrix, result.vectorX), 10);

}

exports.solve = solve;
