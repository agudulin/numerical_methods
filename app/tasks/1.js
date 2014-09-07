// Метод Гаусса решения СЛАУ

var math = require("mathjs");
var utils = require("../utils");

var solve = function() {
  console.log("★★★ Метод Гаусса ★★★\n");

  var matrix = [
    [4.05, -3.5,  -1.0,   2.74,  0],
    [2.12,  1.0,   2.57, -4.33,  0.29],
    [2.64, -1.73,  0,     2.38, -3.04],
    [0,     2.74, -2.25,  2.25,  1.0],
    [0,     0,     4.33,  3.45, -3.45]
  ];

  var vector = [6.27, -12.02, 12.4, 12.48, 12.92];

  var controlVector = math.zeros([vector.length]);
  for(var i = 0; i < matrix.length; i++) {
    for(var j = 0; j < matrix.length; j++) {
      controlVector[i] += matrix[i][j];
    }
    controlVector[i] += vector[i];
  }

  console.log("## Исходная матрица [A]");
  utils.printMatrix(matrix);
  console.log("## Исходный вектор [b]");
  utils.printMatrix(vector);
  console.log("## Контрольный вектор для исходных данных [b^]");
  utils.printMatrix(controlVector);

  var extendedMatrix = utils.clone(matrix);
  // and add two vectors to the end
  for(var i = 0; i < extendedMatrix.length; i++) {
    extendedMatrix[i].push(vector[i]);
    extendedMatrix[i].push(controlVector[i]);
  }

  // utils.printMatrix(extendedMatrix);

  // forward elimination
  // ...
  for(var i = 0; i < matrix.length ; i++) {
    var p = extendedMatrix[i][i];
    for(var j = i + 1; j < matrix.length; j++) {
      var q = extendedMatrix[j][i];
      for(var k = i; k < matrix.length + 2; k++) {
        extendedMatrix[j][k] = extendedMatrix[j][k] - extendedMatrix[i][k] * (q / p);
      }
    }
  }

  console.log("## Результат прямого хода [A, b, b^]");
  utils.printMatrix(extendedMatrix);

  // backward elimination
  // ...
  var x = math.zeros([vector.length]);
  for(var i = matrix.length - 1; i >= 0; i--) {
    var sum = 0;
    for(var j = i + 1; j < matrix.length; j++) {
      sum += extendedMatrix[i][j] * x[j];
    }
    sum = extendedMatrix[i][matrix.length] - sum;
    x[i] = sum / extendedMatrix[i][i];
  }

  var controlVector2 = math.zeros([vector.length]);
  // recalculate control vector
  for(var i = 0; i < matrix.length; i++) {
    for(var j = 0; j < matrix.length + 1; j++) {
      controlVector2[i] += extendedMatrix[i][j];
    }
  }
  console.log("## Контрольный вектор для измененной матрицы [b^~]");
  utils.printMatrix(controlVector2);

  console.log("## Решение [x]");
  utils.printMatrix(x);

  console.log("## Отладка [Ax = b]");
  var debugVector = math.zeros([vector.length]);
  for(var i = 0; i < matrix.length; i++) {
    for(var j = 0; j < matrix.length; j++) {
      debugVector[i] += matrix[i][j] * x[j];
    }
  }
  utils.printMatrix(matrix);
  utils.printMatrix(x);
  utils.printMatrix(debugVector);

}

exports.solve = solve;
