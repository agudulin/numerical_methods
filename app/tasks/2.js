// Метод квадратных корней решения СЛАУ

var math = require("mathjs");
var utils = require("../utils");

function sum1_i(matrix, i, j) {
  var sum = 0;
  for(var k = 0; k < i; k++) {
    sum = math.add(sum, math.multiply(matrix[k][i], matrix[k][j]));
  }
  return sum;
}

var solve = function() {
  console.log("★★★ Метод квадратных корней ★★★\n");

  var matrix = [
    [-0.9234, 0.5311, 0.2,    0.3],
    [0.5311, 1.0013, 1,      0.4],
    [0.2,    1,      1.5741, 0.3],
    [0.3,    0.4,    0.3,    1.9832]
  ];

  var vector = [1.902155, 3.243765, 3.65151, -0.73152];

  console.log("## Исходная матрица [A]");
  utils.printMatrix(matrix);
  console.log("## Исходный вектор [b]");
  utils.printMatrix(vector, 10);

  console.log("## Считаем верхнетреугольную матрицу [S]")
  var matrixS = math.zeros([matrix.length, matrix.length]);
  for(var i = 0; i < matrixS.length; i++) {
    for(var j = 0; j < matrixS.length; j++) {
      if(i == j) {
        matrixS[i][i] = math.sqrt(math.subtract(matrix[i][i], sum1_i(matrixS, i, i)));
      } else if(j > i) {
        matrixS[i][j] = math.divide(math.subtract(matrix[i][j], sum1_i(matrixS, i, j)), matrixS[i][i]);
      }
    }
  }
  utils.printMatrix(matrixS);

  console.log("## Транспонируем матрицу S [S^t]");
  var matrixS_t = math.zeros([matrix.length, matrix.length]);
  for(var i = 0; i < matrixS.length; i++) {
    for(var j = 0; j < matrixS.length; j++) {
      matrixS_t[i][j] = matrixS[j][i];
    }
  }
  utils.printMatrix(matrixS_t);

  console.log("## Проверяем корректность разложения [A = S^t*S]");
  var debugMatrix = math.zeros([matrix.length, matrix.length]);
  for(var i = 0; i < matrix.length; i++) {
    for(var j = 0; j < matrix.length; j++) {
      for(var k = 0; k < matrix.length; k++) {
        debugMatrix[i][j] = math.add(debugMatrix[i][j], math.multiply(matrixS_t[i][k], matrixS[k][j]));
      }
    }
  }
  utils.printMatrix(debugMatrix);

  console.log("## Находим вектор y [из уравнения S^t*y = b]");
  var vectorY = math.zeros([matrix.length]);
  for(var i = 0; i < matrix.length; i++) {
    var sum = 0;
    for(var k = 0; k < i + 1; k++) {
      sum = math.add(sum, math.multiply(matrixS_t[i][k], vectorY[k]));
    }
    vectorY[i] = math.divide(math.subtract(vector[i], sum), matrixS_t[i][i]);
  }
  utils.printMatrix(vectorY, 10);

  console.log("## Находим вектор x [из уравнения S*x = y]");
  var vectorX = math.zeros([matrix.length]);
  for(var i = matrix.length - 1; i >= 0; i--) {
    var sum = 0;
    for(var k = matrix.length - 1; k >= i; k--) {
      sum = math.add(sum, math.multiply(matrixS[i][k], vectorX[k]));
    }
    vectorX[i] = math.divide(math.subtract(vectorY[i], sum), matrixS[i][i]);
  }
  utils.printMatrix(vectorX, 10);

  console.log("## Проверка [A*x = b]");
  utils.printMatrix(math.multiply(matrix, vectorX), 10);

}

exports.solve = solve;
