
from ast import parse, Expr, Assign, BinOp, Name, Num
from operator import add, sub, mul, mod, truediv


class Interpreter:

    def __init__(self):
        self.vars = {}

    def input(self, expression):

        op = {'Sub': sub, 'Add': add, 'Mult': mul, 'Div': truediv, 'Mod': mod}

        def _eval(node):

            if isinstance(node, Expr):
                print("Expr")
                print(node)
                print(node.value)
                return _eval(node.value)
            if isinstance(node, Name):
                return self.vars[node.id]
            if isinstance(node, Num):
                print("num", node.n)
                return node.n
            if isinstance(node, BinOp):
                print(type(node.op).__name__)
                return op[type(node.op).__name__](_eval(node.left), _eval(node.right))
            if isinstance(node, Assign):
                name = node.targets[0].id
                self.vars[name] = _eval(node.value)
                return self.vars[name]

        print('expression',expression)
        tree = parse(expression)
        print(tree)
        return _eval(tree.body[0]) if len(tree.body) else ''

interpreter = Interpreter()
interpreter.input("2 + 2")


'''
initial expr
tree
expression found
operation
2 numbers found
'''