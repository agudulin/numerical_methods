// Метод прогонки

var math = require("mathjs");
var utils = require("../utils");

var N = 10;
// отрезок [a, b]
var a = 0,
    b = 1;
// шаг
var h = (b - a) / N;

// коэффициенты из краевых условий
var alpha_1 = -0.2;
var alpha_2 =  1;
var beta_1  =  0.9;
var beta_2  =  1;
var A       =  0.8;
var B       = -0.1;

var modelA  = 2.6;
var modelB  = 5;
// A = modelA;
// B = modelB;

var solve = function() {
  console.log("★★★ Метод прогонки ★★★\n");

  // Задача
  // ------
  // y'' = cos(x)/(1+x)y' + (2-x)y + x + 1
  // y'(0) = 0.2y(0) + 0.8
  // y'(1) = -0.9y(1) - 0.1

  // \alpha_2 y'(a) + \alpha_1 y(a) = A
  // \beta_2 y'(b) + \beta_1 y(b) = B

  // \alpha_2 = 1  \alpha_1 = -0.2  A =  0.8
  // \beta_2  = 1  \beta_1  =  0.9  B = -0.1 

  // y'' + p(x)y' + q(x)y = f(x)
  // p(x) = -cos(x)/(1+x)
  // q(x) = x - 2
  // f(x) = x + 1
  var p = function(x) { return -math.cos(x) / (1 + x); };
  var q = function(x) { return x - 2; };
  var f = function(x) { return x + 1; };
  var modelF = function(x) {
    return 6*x - math.cos(x)/(1+x)*(x*math.pow(x, 2) + 2) - (2-x)*(math.pow(x, 3) + 2*x - 3)
  };
  // f = modelF;

  var a_i = function(x) { return 1 + (h * p(x)) / 2; };
  var b_i = function(x) { return 2 - math.pow(h, 2) * q(x); };
  var c_i = function(x) { return 1 - (h * p(x)) / 2; };
  var g_i = function(x) { return math.pow(h, 2) * f(x); };

  var x = math.zeros([N+1]);
  for (var i = 0; i <= N; i++) {
    x[i] = a + i * h;
  }

  var ai = math.zeros([N+1]),
      bi = math.zeros([N+1]),
      ci = math.zeros([N+1]),
      gi = math.zeros([N+1]);
  
  // считаем коэффициенты
  for (var i = 1; i < N; i++) {
    ai[i] = a_i(x[i]);
    bi[i] = b_i(x[i]);
    ci[i] = c_i(x[i]);
    gi[i] = g_i(x[i]);
  }

  var threeDiagMatrix = math.zeros([N + 1, N + 1]);
  // заполняем середину матрицы
  for (var i = 1; i < N; i++) {
    threeDiagMatrix[i][i-1] = ci[i];
    threeDiagMatrix[i][i] = - bi[i];
    threeDiagMatrix[i][i+1] = ai[i];
  }

  // аппроксимируем граничные условия
  // y_0 = kappa_1 * y_1 + nu_1
  // y_n = kappa_2 * y_{n-1} + nu_2
  //// var v0 = (h * ci[1] - gi[1]) / (h * ci[1] + 3 * ci[1] - ai[1]);
  //// var x0 = -1 * (bi[1] - 4 * ci[1]) / (h * ci[1] + 3 * ci[1] - ai[1]);
  var kappa_1 = (alpha_2 * bi[1] - 4 * alpha_2 * ai[1]) / (-3 * alpha_2 * ai[1] + alpha_2 * ci[1] + 2 * alpha_1 * h * ai[1]);
  var kappa_2 = (4 * beta_2 * ci[N-1] - beta_2 * bi[N-1]) / (3 * beta_2 * ci[N-1] + 2 * beta_1 * h * ci[N-1] - beta_2 * ai[N-1]);

  threeDiagMatrix[0][0]   = 1;
  threeDiagMatrix[0][1]   = -kappa_1;
  threeDiagMatrix[N][N-1] = -kappa_2;
  threeDiagMatrix[N][N]   = 1;

  console.log("## Трехдиагональная матрица коэффициентов:");
  utils.printMatrix(threeDiagMatrix);

  var nu_1 = (2 * h * a_i(a + h) * A + alpha_2 * g_i(a + h)) / (-3 * alpha_2 * a_i(a + h) + alpha_2 * c_i(a + h) + 2 * alpha_1 * h * a_i(a + h));
  var nu_2 = (2 * h * c_i(b - h) * B - beta_2 * g_i(b - h)) / (3 * beta_2 * c_i(b - h) + 2 * beta_1 * h * c_i(b - h) - beta_2 * a_i(b - h));;
  gi[0] = nu_1;
  gi[N] = nu_2;

  // Метод правой прогонки
  // ищем решение в виде y_i = u_i * y_{i+1} + v_i
  // ---------------------------------------------
  // Прямой ход (определяем прогоночные коэффициенты u_i, v_i)
  var u = math.zeros([N + 1]);
  var v = math.zeros([N + 1]);
  u[0] = kappa_1;
  v[0] = nu_1;

  for(var i = 1; i <= N; i++) {
    u[i] = a_i(x[i]) / (b_i(x[i]) - c_i(x[i]) * u[i - 1]);
    v[i] = (c_i(x[i]) * v[i - 1] - g_i(x[i])) / (b_i(x[i]) - c_i(x[i]) * u[i - 1]); 
  }

  console.log("## Результат прямого хода (коэффициенты u_i, v_i):");
  for(var i = 0; i < u.length; i++) {
    console.log(u[i] + "\t" + v[i]);
  }

  // Обратный ход (находим y_i)
  var y = math.zeros([N + 1]);
  y[N] = (nu_2 + kappa_2 * v[N-1]) / (1 -  kappa_2 * u[N - 1]);
  for(var i = N-1; i >= 0; i--) {
    y[i] = u[i] * y[i + 1] + v[i];
  }

  console.log("\n## Результат обратного хода (y_i):");
  for(var i = 0; i < y.length; i++) {
    console.log(math.format(y[i], 5));
  }
  
  console.log("\n## Проверка: (diagMatrix * y)_i, g_i:");
  var result = math.zeros([N + 1]);
  for(var i = 0; i <= N; i++) {
    for(var j = 0; j <= N; j++) {
        result[i] += threeDiagMatrix[i][j] * y[j];
    }
  }
  for(var i = 0; i < result.length; i++) {
    console.log(math.format(result[i], 10) + "\t" + math.format(gi[i], 10));
  }

  // console.log("\nx_i\ty_i\t\tmodelF(x_i):");
  // for(var i = 0; i < y.length; i++) {
  //   console.log(math.format(x[i], 2) + "\t" + math.format(y[i], 7) + "\t" + math.format((math.pow(x[i], 3) + 2*x[i] - 3), 5));
  // }

}

exports.solve = solve;
