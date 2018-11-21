
function i(obj) {
    return JSON.stringify(obj);
}

function Interpreter() {
    this.functions = {};
    this.variables = {};
}
Interpreter.prototype = {
    input: function (expr) {
        var tokens = this.tokenize(expr);
        console.log(tokens) // ​​​​​[ '1', '+', '1' ]​​​​​
        
        var tree = this.parse(tokens);
        console.log(tree)
        /*
            ​​​​​{ type: 'operator',​​​​​
​​​​​              operator: '+',​​​​​
            ​​​​​  left: { type: 'number', value: '1' },​​​​​
            ​​​​​  right: { type: 'number', value: '1' } }​​​​​
        */
        var result = this.interpret(tree);
        return result;
    },
    interpret: function (tree) {
        switch (tree.type) {
            case "operator":
                return this.interpretOperator(tree);
            case "number":
                return this.interpretNumber(tree);
            case "assignment":
                return this.interpretAssignment(tree);
            case "identifier":
                return this.interpretIdentifier(tree);
            case "function":
                return this.interpretFunction(tree);
            case "fnCall":
                return this.interpretFnCall(tree);
            case "container":
                return this.interpretContainer(tree);
            case "noop":
                return this.interpretNoop(tree);
            default:
                throw "What type is " + JSON.stringify(tree);
        }
    },
    interpretNumber: function (number) {
        return parseFloat(number.value);
    },
    interpretAssignment: function (assignment) {
        if (assignment.name in this.functions)
            throw "Variable name collides with function name: " + assignment.name;
        var value = this.interpret(assignment.value);
        this.variables[assignment.name] = value;
        return value;
    },
    interpretIdentifier: function (identifier) {
        if (identifier.value in this.variables)
            return this.variables[identifier.value];
        throw "Missing identifier: " + identifier.value;
    },
    interpretFunction: function (fn) {
        if (fn.name in this.variables)
            throw "Function name collides with variable name: " + fn.name;
        this.functions[fn.name] = fn;
        return "";
    },
    interpretFnCall: function (fnCall) {
        // { type: 'fnCall',
        //   name: 'avg',
        //   args: [ [ 'x', [Object] ], [ 'y', [Object] ] ] }
        var that = this;
        var fn = this.functions[fnCall.name];
        console.log(fn)
        console.log(fnCall)
        var args = fnCall.args.reduce(function (args, pair) {
            console.log(pair[1])
            args[pair[0]] = that.interpret(pair[1]);
            return args;
        }, Object.create(this.variables));
        console.log(args)
        var oldVars = this.variables;
        this.variables = args;
        var result = this.interpret(fn.body);
        this.variables = oldVars;
        return result;
    },
    interpretOperator: function (tree) {
        var left = this.interpret(tree.left);
        var right = this.interpret(tree.right);
        switch (tree.operator) {
            case "+":
                return left + right;
            case "*":
                return left * right;
            case "-":
                return left - right;
            case "/":
                return left / right;
            case "%":
                return left % right;
            default:
                throw "What operator is in here? " + JSON.stringify(tree);
        }
    },
    interpretNoop: function (noop) {
        return "";
    },
    interpretContainer: function (container) {
        return this.interpret(container.child);
    },
    tokenize: function (program) {
        if (program === "")
            return [];
        var regex = /\s*(=>|[-+*\/\%=\(\)]|[A-Za-z_][A-Za-z0-9_]*|[0-9]*\.?[0-9]+)\s*/g;
        return program.split(regex).filter(function (s) {
            return !s.match(/^\s*$/);
        });
    },
    parse: function (tokens) {
        var parsed = new Parser(this.functions, tokens).parse();
        if (tokens.length !== 0)
            throw "Extra tokens: " + i(tokens);
        return parsed;
    },
    parseString: function (code) {
        var tokens = this.tokenize(code);
        return this.parse(tokens);
    },
};


function Parser(functions, tokens) {
    this.functions = functions;
    console.log(this.functions)
    this.tokens = tokens;
    console.log(this.tokens)
}
Parser.prototype = {
    parse: function () {
        if (this.noInput())
            return this.noop();
        if (this.isFunction()) // this.tokens[0] === 'fn'
            return this.parseFn();
        else
            return this.parseExpr();
    },
    parseFn: function () {
        this.shift(); // fn
        var name = this.tokens.shift();
        console.log(this.tokens)
        var args = this.parseFnArgs(); // Get the args
        console.log(args)
        this.shift(); // =>
        console.log(this.tokens)
        var body = this.parseExpr();
        console.log(body)
        this.validateIdentifiers(args, body);
        var fn = {
            type: "function",
            name: name,
            args: args,
            body: body,
        };
        return fn;
    },
    shift: function () {
        return this.tokens.shift();
    },
    parseExpr: function () {
        var leftExpr = null;
        var rightExpr = null;

        if (this.tokens.length === 0)
            throw "omg!";

        if (this.isAssignment()) {
            leftExpr = this.parseAssignment();
        } else if (this.isNumber()) { // match(/^[0-9][\.0-9]*$/)
            leftExpr = this.parseNumber(); // type:'number'
        } else if (this.isFnCall()) { // identifier and this.functions[this.tokens[0]]
            leftExpr = this.parseFnCall();
        } else if (this.isIdentifier()) { // match(/^[a-zA-Z][_a-zA-Z0-9]*$/)
            leftExpr = this.parseIdentifier();
        } else if (this.opensContainer()) {
            leftExpr = this.parseContainer();
        } else if (this.isFunction()) { // tokens[0] === 'fn'
            leftExpr = this.parseFn();
        } else if (this.closesContainer()) {
            throw "WHAT THE FUCK IS: " + JSON.stringify(this.tokens);
        }

        if (this.tokens.length === 0)
            return leftExpr;

        if (!this.isOperator())
            return leftExpr;

        console.log(leftExpr)
        var operator = this.shift();
        console.log(operator)
        console.log(this.tokens)
        var rightExpr = this.parseExpr();
        console.log(rightExpr)
        if ((rightExpr.type !== 'operator') || (!this.shouldSwapOperators(operator, rightExpr.operator)))
            return {
                type: "operator",
                operator: operator,
                left: leftExpr,
                right: rightExpr,
            };

        rightExpr.left = {
            type: "operator",
            operator: operator,
            left: leftExpr,
            right: rightExpr.left,
        }
        return rightExpr;
    },
    noInput: function () {
        return this.tokens.length === 0;
    },
    noop: function () {
        return {
            type: 'noop'
        };
    },
    isFnCall: function () {
        return this.isIdentifier() && this.functions[this.tokens[0]];
    },
    isNumber: function () {
        return this.tokens[0].match(/^[0-9][\.0-9]*$/);
    },
    isOperator: function () {
        var t = this.tokens[0];
        return t === '+' ||
            t === '-' ||
            t === '*' ||
            t === '/' ||
            t === '%';
    },
    shouldSwapOperators: function (leftOp, rightOp) {
        return leftOp === '*' || leftOp === '/' || leftOp === '%' ||
            rightOp === '+' || rightOp === '-';
    },
    isIdentifier: function () {
        return this.tokens[0].match(/^[a-zA-Z][_a-zA-Z0-9]*$/);
    },
    isAssignment: function () {
        return this.isIdentifier() && this.tokens[1] === '=';
    },
    opensContainer: function () {
        return this.tokens[0][0] === '(';
    },
    closesContainer: function () {
        return this.tokens[0][0] === ')';
    },
    isFunction: function () {
        return this.tokens[0] === 'fn';
    },
    parseNumber: function () {
        console.log(this.tokens)
        return {
            type: "number",
            value: this.tokens.shift()
        };
    },
    parseIdentifier: function () {
        return {
            type: "identifier",
            value: this.tokens.shift()
        };
    },
    parseAssignment: function () {
        var name = this.parseIdentifier().value;
        this.shift(); // =
        var value = this.parseExpr();
        return {
            type: "assignment",
            name: name,
            value: value
        };
    },
    parseFnCall: function () {
        var that = this;
        console.log(that)
        console.log(this.tokens)
        var name = this.tokens.shift();
        var fn = this.functions[name];
        console.log(fn)
        var args = fn.args.map(function (name) {
            if (that.tokens.length === 0)
                throw "Too few arguments!";
            return [name, that.parse()];
        });
        console.log(args)
        return {
            type: "fnCall",
            name: name,
            args: args,
        };
    },
    parseContainer: function () {
        this.shift(); // (
        var expr = this.parseExpr();
        this.shift(); // )
        console.log(expr)
        return {
            type: 'container',
            child: expr
        };
    },
    parseFnArgs: function () {
        var args = [];
        while (this.tokens[0] !== "=>")
            args.push(this.tokens.shift());
        if (this.containsDuplicates(args))
            throw "Duplicate argument names";
        return args;
    },
    containsDuplicates: function (array) {
        for (var i = 0; i < array.length; ++i)
            for (var j = i + 1; j < array.length; ++j)
                if (array[i] === array[j])
                    return true;
        return false;
    },
    validateIdentifiers: function (names, tree) {
        var used = this.varNames(tree);
        used.forEach(function (name) {
            if (-1 === names.indexOf(name))
                throw "Unknown identifier: " + name;
        });
    },
    varNames: function (tree) {
        switch (tree.type) {
            case "operator":
                return this.varNames(tree.left).concat(this.varNames(tree.right));
            case "number":
                return [];
            case "assignment":
                return this.varNames(tree.value);
            case "identifier":
                return [tree.value];
            case "function":
                return [];
            case "fnCall":
                var all = [];
                args.forEach(function (crnt) {
                    all = all.concat(crnt);
                });
                return all;
            case "container":
                return this.varNames(tree.child);
            case "noop":
                return [];
            default:
                throw "What type is " + JSON.stringify(tree);
        }
    }
}

var interpreter = new Interpreter();


// Basic arithmetic
// console.log(interpreter.input("1 + 1"), 2);
// console.log(interpreter.input("x = 7"), );
// console.log(interpreter.input("x = x + 1"), );
console.log(interpreter.input("fn func num => num * 2"));
console.log(interpreter.input("func(3)"), 6);
// console.log(interpreter.input('x = 7'))
// console.log(interpreter.input(''))
// console.log(interpreter.input('x'))
// console.log(interpreter.input("fn func2 num, num2 => num * num2"));
// console.log(interpreter.input("func2(2)"));

// console.log(interpreter.input("2 - 1"), 1);
// console.log(interpreter.input("2 * 3"), 6);
// console.log(interpreter.input("8 / 4"), 2);
// console.log(interpreter.input("7 % 4"), 3);

//Variables
// console.log(interpreter.input("x = 1"), 1);
// console.log(interpreter.input("x"), 1);
// console.log(interpreter.input("x + 3"), 4);
// console.log(function () {
//     interpreter.input("y");
// });

