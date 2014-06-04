﻿test("X.ch basics", function () {
    var c = X();

    ok(c, "can be created without 'new' keyword");

    ok(typeof c === 'function', "is a function");

    strictEqual(c(), undefined, "unassigned ch has value of undefined");

    c(1);

    strictEqual(c(), 1, "returns stored value");
    strictEqual(c(2), 2, "returns value when stored");

    c = X("test");

    strictEqual(c(), "test", "can be created with initial values");

    c = new X();

    ok(typeof c === 'function', "can be created with 'new' keyword");
});

test("X.proc basics", function () {
    var p, v;

    throws(function () { X.proc(); }, "throws if no fn defined");
    throws(function () { X.proc(1); }, "throws if arg is not a function");

    p = X(function () { return 1; });

    ok(typeof p === 'function', "is a function");

    strictEqual(p(), 1, "returns value of getter function");

    v = 5;
    p = X(function () { return v; });

    strictEqual(p(), 5, "returns value of getter function, when getter references non-tracked values");

    v = 6;
    strictEqual(p(), 5, "does not re-calculate when non-tracked values change, even if they would change the value returned by the getter");
});

test("X.proc to X.ch dependencies", function () {
    var c = X(1),
        p_evals = 0,
        p = X(function () { p_evals++; return c(); });

    strictEqual(p_evals, 1, "evaluates once on definition");
    strictEqual(p(), 1, "reflects value of source");

    c(2);

    strictEqual(p(), 2, "reflects changes to source");

    p_evals = 0;
    p();
    c();
    strictEqual(p_evals, 0, "uses memoized value");

    p_evals = 0;
    c(5);
    strictEqual(p_evals, 1, "re-evaluates when source changes");
});

test("X.proc to X.ch dynamic dependencies", function () {
    var pred = X(true), t = X("t"), f = X("f"),
        p_evals = 0,
        p = X(function () { p_evals++; return pred() ? t() : f(); });

    strictEqual(p(), "t", "reflects value of complex source");

    p_evals = 0;
    f("F");
    strictEqual(p_evals, 0, "does not re-evaluate when irrelevant channel changes");

    p_evals = 0;
    pred(false);

    strictEqual(p_evals, 1, "re-evaluates when relevant channel changes");
    strictEqual(p(), "F", "reflects value of changed complex source");

    p_evals = 0;
    t("T");
    strictEqual(p_evals, 0, "does not re-evaluate when now-irrelevant channel changes");

    p_evals = 0;
    f("f");
    strictEqual(p_evals, 1, "does re-evalute when now-relevant channel changes");
    strictEqual(p(), "f", "reflects value of chamged complex source");
});

test("X.proc to X.proc dependencies", function () {
    var c = X(1),
        p1 = X(function () { return c(); }),
        p2 = X(function () { return p1(); });

    c(2);

    strictEqual(p2(), 2, "changes propagate through procs");
});

test("X.seq creation", function () {
    var s = X.seq([1, 2, 3]);

    ok(s, "can be created");

    deepEqual(s(), [1, 2, 3], "contains expected values");

    var t = X([1, 2, 3, 4]);

    ok(t, "can be created with X([...]) shorthand");

    deepEqual(t(), [1, 2, 3, 4], "object created by X[...]) shorthand contains expected values");
});

test("X.seq reset", function () {
    var s = X.seq([1, 2, 3]);

    s([4, 5, 6]);

    deepEqual(s(), [4,5,6], "seq reflects reset values");
});

test("X.seq.add", function () {
    var s = X.seq([1, 2, 3]);

    s.add(4);

    deepEqual(s(), [1, 2, 3, 4], "added item appears in values");
});

test("X.seq.remove", function () {
    var s = X.seq([1, 2, 3, 4, 5]);

    s.remove(5);

    deepEqual(s(), [1, 2, 3, 4], "value removed from end is gone");

    s.remove(3);

    deepEqual(s(), [1, 2, 4], "value removed from middle is gone");

    s.remove(1);

    deepEqual(s(), [2, 4], "value removed from beginning is gone");
});

test("X.seq.map creation", function () {
    var s = X.seq([1, 2, 3]),
        m = s .X. map(function (i) { return i * 2; });

    ok(m, "map returns object");

    ok(m.X, "object returned by map is a seq");

    deepEqual(m(), [2, 4, 6], "map contains expected values");
});

test("X.seq.map with add", function () {
    var s = X.seq([1, 2, 3]),
        m = s .X. map(function (i) { return i * 2; });

    s.add(4);

    deepEqual(m(), [2, 4, 6, 8], "map updates with expected added value");
});

test("X.seq.map with remove", function () {
    var s = X.seq([1, 2, 3, 4, 5]),
        exited = [],
        m = s .X. map(function (i) { return i * 2; }, function (i) { exited.push(i); });

    s.remove(5);

    deepEqual(m(), [2, 4, 6, 8], "map responds to removal from end");
    deepEqual(exited, [10], "exit called for value removed from end");

    s.remove(3);

    deepEqual(m(), [2, 4, 8], "map responds to removal from middle");
    deepEqual(exited, [10, 6], "exit called for value removed from middle");

    s.remove(1);

    deepEqual(m(), [4, 8], "map responds to removal from start");
    deepEqual(exited, [10, 6, 2], "exit called for value removed from start");
});

test("X.seq.enter creation", function () {
    var s = X.seq([1, 2, 3]),
        m = s .X. enter(function (i) { return i * 2; });

    ok(m, "enter returns object");

    ok(m.X, "object returned by enter is a seq");

    deepEqual(m(), [2, 4, 6], "enter contains expected values");
});

test("X.seq.enter with add", function () {
    var s = X.seq([1, 2, 3]),
        m = s .X. enter(function (i) { return i * 2; });

    s.add(4);

    deepEqual(m(), [2, 4, 6, 8], "enter updates with expected added value");
});

test("X.seq.enter with reset", function () {
    var s = X.seq([1, 2, 3]),
        m = s .X. enter(function (i) { return i * 2; });

    s([4, 5, 6]);

    deepEqual(m(), [8, 10, 12], "enter updates with expected added value");
});

test("X.seq.exit with reset", function () {
    var s = X.seq([1, 2, 3]),
        exited = [],
        m = s .X. exit(function (i) { exited.push(i); });

    s([3, 4, 5, 6]);

    deepEqual(m(), [3, 4, 5, 6], "exit returns correct array value");
    deepEqual(exited, [1, 2], "exit called for removed values");
});

test("X.seq.exit with remove", function () {
    var s = X.seq([1, 2, 3, 4, 5]),
        exited = [],
        m = s .X. exit(function (i) { exited.push(i); });

    s.remove(5);

    deepEqual(m(), [1, 2, 3, 4], "map responds to removal from end");
    deepEqual(exited, [5], "exit called for value removed from end");

    s.remove(3);

    deepEqual(m(), [1, 2, 4], "map responds to removal from middle");
    deepEqual(exited, [5, 3], "exit called for value removed from middle");

    s.remove(1);

    deepEqual(m(), [2, 4], "map responds to removal from start");
    deepEqual(exited, [5, 3, 1], "exit called for value removed from start");
});

test("X.seq.filter", function () {
    var s = X.seq([1, 2, 3, 4, 5, 6]),
        f = s .X. filter(function (n) { return n % 2; });

    deepEqual(f(), [1, 3, 5]);
});

test("X.seq.map with chanels", function () {
    var c = X(true),
        s = X([c]),
        f = function (c) { return c(); },
        m = s .X. map(f);

    c(false);

    deepEqual(m(), [true]);

    deepEqual(_.map(s(), f), [false]);

});

function mapSpeed() {
    var i, j, s, m, c = 0;

    for (i = 1; i <= 10000; i++) {
        s = X.seq([]);
        m = s.X.map(function (v) { c++; return v * 2; });
        for (j = 0; j < 50; j++) {
            s.add(j);
        }
    }

    return c;
}

function enterSpeed() {
    var i, j, s, m, c = 0;

    for (i = 1; i <= 10000; i++) {
        s = X.seq([]);
        m = s.X.enter(function (v) { c++; return v * 2; });
        for (j = 0; j < 50; j++) {
            s.add(j);
        }
    }

    return c;
}

function propagateSpeed(nary, depth) {
    var root = X.ch(0), c = 0, i;

    tree(root, nary, depth);

    for (i = 1; i <= 10000; i++) {
        root(i);
    }

    return c;

    function tree(node, nary, depth) {
        if (depth <= 0) return;
        for (var i = 0; i < nary; i++) {
            tree(X(function () { c++; return node() + 1; }), nary, depth - 1);
        }
    }
}

function chCreateSpeed(count) {
    var i;

    for (i = 0; i < count; i++) {
        X.ch(i);
    }
}

function procCreateSpeed(count) {
    var i;

    for (i = 0; i < count; i++) {
        X.proc(function () { });
    }
}