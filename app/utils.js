var math = require("mathjs");

function print(value) {
  var precision = 14;
  console.log(math.format(value, precision));
}

function printMatrix(matrix, precision) {
  if (precision === undefined) {
     precision = 4;
  }
  if (math.type.Matrix.isMatrix(matrix)) {
    matrix = matrix.toArray();
  }
  var matrixSize = matrix.length;
  matrix.forEach(function (value, index) {
    var line = "";
    if (typeof value == "object") {
      value.forEach(function (val, idx) {
        line += math.format(val, precision) + "\t"
      });
      console.log(line);
    } else {
      console.log(math.format(value, precision));
    }
  });
  console.log("");
}

exports.print = print;
exports.printMatrix = printMatrix;
