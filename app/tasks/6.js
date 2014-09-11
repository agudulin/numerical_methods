// Метод-шметод

var math = require("mathjs");
var utils = require("../utils");

var f     = function(x, t) { return math.exp(-t) * (math.pow(x, 2) - x + 2); }
var u_x_0 = function(x)    { return math.cos(2 * x) + (1 - x) * x; }
var u_0_t = function(t)    { return math.exp(-4 * t); }
var u_1_t = function(t)    { return math.exp(-4 * t) * math.cos(2); }
// точное решение
var u_star = function(x, t) {
  return math.exp(-4 * t) * math.cos(2) + math.exp(-t) * (1 - x) * x;
}

var a_i = function() { return 1 / math.pow(h, 2); }
var b_i = function() { return 1 / tau + 2 / math.pow(h, 2); }
var c_i = function() { return 1 / math.pow(h, 2); }

var a = 0;
var b = 1;
var n = 10;
var h = (b - a) / n;

var tau = math.pow(h, 2) / 2;
var m = 500;
var T = m * tau;

var implicitScheme = function(x, u_k) {
  var threeDiagMatrix = math.zeros([n + 1, n + 1]);
  threeDiagMatrix[0][0] = 1;
  threeDiagMatrix[n][n] = 1;
  for(var i = 1; i < n; i++) {
    threeDiagMatrix[i][i-1] = a_i();
    threeDiagMatrix[i][i] = - b_i();
    threeDiagMatrix[i][i+1] = c_i();
  }

  for(var k = 1; k <= m; k++) {
    var t_k = k * tau;
    var gi = math.zeros([n + 1]);
    gi[0] = u_0_t(t_k);
    gi[n] = u_1_t(t_k);

    for(var i = 1; i < n; i++) {
      gi[i] = - u_k[i] / tau - f(x[i], t_k);
    }

    var s = math.zeros([n + 1]);
    var v = math.zeros([n + 1]);
    s[0] = 0;
    v[0] = gi[0];
    for(var i = 1; i < n; i++) {
      s[i] = a_i() / (b_i() - c_i() * s[i - 1]);
      v[i] = (c_i() * v[i - 1] - gi[i]) / (b_i() - c_i() * s[i - 1]);
    }

    var u_k_1 = math.zeros([n + 1]);
    u_k_1[n] = gi[n];
    for(var i = n - 1; i >= 0; i--) {
      u_k_1[i] = s[i] * u_k_1[i + 1] + v[i];
    }

    if(!(k % 100)) {
      console.log("\nk = " + k);
      console.log("\nu_{k+1}\t\tu_*");
      console.log("=============================");
      for(var l = 0; l <= n; l++) {
        console.log(math.format(u_k_1[l], 8) + "\t" + math.format(u_star(x[l], t_k), 8));
      }
      console.log("\n");
    }

    for(var i = 0; i <= n; i++) {
      u_k[i] = u_k_1[i];
    }

  }

  console.log("\n## Проверка: (diagMatrix * u_k)_i, g_i:");
  var result = math.zeros([n + 1]);
  for(var i = 0; i <= n; i++) {
    for(var j = 0; j <= n; j++) {
        result[i] += threeDiagMatrix[i][j] * u_k_1[j];
    }
  }
  for(var i = 0; i < result.length; i++) {
    console.log(math.format(result[i], 5) + "\t\t" + math.format(gi[i], 5));
  }
};

var explicitScheme = function(x, u_k) {
  var h_2 = 1 / math.pow(h, 2);
  var u_k_1 = math.zeros([n + 1]);

  for(var k = 1; k <= m; k++) {
    var t_k = k * tau;
    u_k_1[0] = u_0_t(t_k); 
    u_k_1[n] = u_1_t(t_k);

    for(var i = 1; i < n; i++) {
      var x_i = a + i * h;
      u_k_1[i] = u_k[i + 1] * tau * h_2 + u_k[i] * (1 - 2 * tau * h_2) + u_k[i - 1] * tau * h_2 + f(x_i, t_k) * tau;
    }

    if(!(k % 100)) {
      console.log("\nk = " + k);
      console.log("\nu_{k+1}\t\tu_*");
      console.log("=============================");
      for(var l = 0; l <= n; l++) {
        console.log(math.format(u_k_1[l], 8) + "\t" + math.format(u_star(x[l], t_k), 8));
      }
      console.log("\n");
    }

    u_k = math.clone(u_k_1);
  }
};

var solve = function() {
  var x = math.zeros([n + 1]);
  for (var i = 0; i <= n; i++) {
    x[i] = a + i * h;
  }

  var u_k = math.zeros([n + 1]);
  for(var i = 0; i < n + 1; i++) {
    u_k[i] = u_x_0(x[i]);
  }

  console.log("★★★ Явная схема ★★★\n");
  explicitScheme(x, u_k);

  console.log("\n----------------------------------------\n");
  console.log("----------------------------------------\n");

  console.log("★★★ Неявная схема ★★★\n");
  implicitScheme(x, u_k);
}

exports.solve = solve;
