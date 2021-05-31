clc; clear;
syms x(t) y(t) s

x(t) = t^2 + 5 * t + 3;
y_eqn = diff(y, t, 2) + 3 * diff(y, t) + 2 * y(t);

x_coeffs = double(subs(flip(coeffs(x(t)))));
y_coeffs = double(subs(flip(coeffs(y_eqn))));
delta = y_coeffs(2)^2 - 4 * y_coeffs(1) * y_coeffs(3);
s1 = (-y_coeffs(2) + sqrt(delta)) / 2 * y_coeffs(1);
s2 = (-y_coeffs(2) - sqrt(delta)) / 2 * y_coeffs(1);

dx(t) = diff(x, t);
eqn = y_eqn == dx(t);
Dy = diff(y, t);
cond = [y(0) == 2, Dy(0) == 3];
sol = dsolve(eqn, cond)
