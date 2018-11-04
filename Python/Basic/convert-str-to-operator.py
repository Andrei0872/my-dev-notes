

OPERATORS = {'+': 'add', '-': 'sub', '*': 'mul', '/': 'div'}
def apply_operator(a,op,b):
    method = '__%s__' % OPERATORS[op]
    return getattr(a,method)(b)

print(apply_operator(2,'+',3)) # 5


# =============================================================

def get_operator(op):
    obj = {
        '+' : (lambda x,y : x + y),
        '-' : (lambda x,y : x - y),
        '*' : (lambda x,y : x * y),
        '/' : (lambda x,y : x / y),
        '%' : (lambda x,y : x % y),
        '//' : (lambda x,y : x // y)
    } 
    return obj[op] if op in obj else False

print(get_operator('+')(2,3)) # 5