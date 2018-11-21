/********** TOKEN **********/

class Token {

    constructor(type, value) {
      this.type = type;
      this.value = value;
    }
    
    toString() {
      return `Token(${this.type}, ${this.value})`;
    }
    
  }
  
  Object.assign(Token, {
    PLUS: 'PLUS',
    MINUS: 'MINUS',
    MUL: 'MUL',
    DIV: 'DIV',
    MOD: 'MOD',
    ASSIGN: 'ASSIGN',
    LPAREN: 'LPAREN',
    RPAREN: 'RPAREN',
    IDENTIFIER: 'IDENTIFIER',
    NUMBER: 'NUMBER'
  });
  
  
  
  /********** LEXER **********/
  
  const isDigit = char => /^\d$/.test(char);
  const isLetter = char => /^[a-zA-Z]$/.test(char);
  const isIdChar = char => char === '_' || isLetter(char) || isDigit(char);
  const isWhitespace = char => /^\s$/.test(char);
  
  class Lexer {
    
    constructor() {
    
    }
    
    receiveNewInput(input) {
      this.input = input;
      this.pos = 0;
      this.maxPos = this.input.length - 1;
      this.currentChar = this.input[this.pos];
    }
    
    error() {
      throw new Error(`Unexpected character: ${this.currentChar}`);
    }
    
    advance() {
      this.pos++;
      this.currentChar = this.pos > this.maxPos ? null : this.input[this.pos];
    }
    
    skipWhitespace() {
      while (isWhitespace(this.currentChar)) {
        this.advance();
      }
    }
    
    getNumber() {
    
      let number = '';
      
      while (isDigit(this.currentChar)) {
        number += this.currentChar;
        this.advance();
      }
      
      if (this.currentChar === '.') {
      
        number += this.currentChar;
        this.advance();
        
        if (!isDigit(this.currentChar)) {
          this.error();
        }
        
        while (isDigit(this.currentChar)) {
          number += this.currentChar;
          this.advance();
        }
      }
      
      return parseFloat(number);
    }
    
    getIdentifier() {
      
      let identifier = this.currentChar;
      this.advance();
      
      while (isIdChar(this.currentChar)) {
        identifier += this.currentChar;
        this.advance();
      }
      
      return identifier;
    }
    
    getNextToken() {
      
      while (this.currentChar !== null) {
        
        let c = this.currentChar;
        
        if (isWhitespace(c)) {
          this.skipWhitespace();
          continue;
        }
        
        if (isDigit(c)) {
          return new Token(Token.NUMBER, this.getNumber());
        }
        
        if (isLetter(c) || c === '_') {
          return new Token(Token.IDENTIFIER, this.getIdentifier());
        }
        
        switch(c) {
          case '+':
            this.advance();
            return new Token(Token.PLUS, c);
          case '-':
            this.advance();
            return new Token(Token.MINUS, c);
          case '*':
            this.advance();
            return new Token(Token.MUL, c);
          case '/':
            this.advance();
            return new Token(Token.DIV, c);
          case '%':
            this.advance();
            return new Token(Token.MOD, c);
          case '=':
            this.advance();
            return new Token(Token.ASSIGN, c);
          case '(':
            this.advance();
            return new Token(Token.LPAREN, c);
          case ')':
            this.advance();
            return new Token(Token.RPAREN, c);
        }
        
        this.error();
      }
      
      return new Token(Token.EOF, null);
    }
  
  }
  
  
  
  /********** AST **********/
  
  class ASTNode {
    constructor() {
    }
  }
  
  class AssignmentNode extends ASTNode {
    constructor(token, expr) {
      super();
      this.token = token;
      this.expr = expr;
    }
  }
  
  class BinaryOpNode extends ASTNode {
    constructor(token, left, right) {
      super();
      this.token = token;
      this.left = left;
      this.right = right;
    }
  }
  
  class VariableNode extends ASTNode {
    constructor(token) {
      super();
      this.token = token;
    }
  }
  
  class NumberNode extends ASTNode {
    constructor(token) {
      super();
      this.token = token;
    }
  }
  
  
  
  /********** PARSER **********/
  
  class Parser {
  
    constructor() {
      this.lexer = new Lexer();
    }
    
    receiveNewInput(input) {
      this.lexer.receiveNewInput(input);
      this.currentToken = this.lexer.getNextToken();
    }
    
    error() {
      throw new SyntaxError(`Unexpected token: ${this.currentToken}`);
    }
    
    eat(tokenType) {
      if (this.currentToken.type !== tokenType) {
        this.error();
      }
      this.currentToken = this.lexer.getNextToken();
    }
    
    expr() {
      
      let node = this.term();
      
      while ([Token.PLUS, Token.MINUS].indexOf(this.currentToken.type) > -1) {
        let token = this.currentToken;
        this.eat(token.type);
        node = new BinaryOpNode(token, node, this.term());
      }
      
      return node;
    }
    
    term() {
      
      let node = this.factor();
      
      while ([Token.MUL, Token.DIV, Token.MOD].indexOf(this.currentToken.type) > -1) {
        let token = this.currentToken;
        this.eat(token.type);
        node = new BinaryOpNode(token, node, this.factor());
      }
      
      return node;
    }
    
    factor() {
    
      let token = this.currentToken;
      
      if (token.type === Token.NUMBER) {
        this.eat(Token.NUMBER);
        return new NumberNode(token);
      }
      
      if (token.type === Token.IDENTIFIER) {
        
        this.eat(Token.IDENTIFIER);
        
        if (this.currentToken.type === Token.ASSIGN) {
          this.eat(Token.ASSIGN);
          return new AssignmentNode(token, this.expr());
        } else {
          return new VariableNode(token);
        }
      }
      
      if (token.type === Token.LPAREN) {
        this.eat(Token.LPAREN);
        let node = this.expr();
        this.eat(Token.RPAREN);
        return node;
      }
    }
    
    parse() {
      let ast = this.expr();
      return ast;
    }
    
  }
  
  
  
  /********** INTERPRETER **********/
  
  class SymbolTable {
    
    constructor() {
      this.table = {};
    }
    
    get(varName) {
      if (this.table.hasOwnProperty(varName))
        return this.table[varName];
      else
        throw new ReferenceError(`${varName} is not defined`);
    }
    
    set(varName, value) {
      this.table[varName] = value;
    }
  
  }
  
  class NodeVisitor {
    
    visit(node) {
      let methodName = `visit${node.constructor.name}`;
      let visitor = this[methodName];
      return visitor ? visitor(node) : this.genericVisit(node);
    }
    
    genericVisit(node) {
      throw new Error('No method: visit' + node.constructor.name);
    }
    
  }
  
  class Interpreter extends NodeVisitor {
    
    constructor() {
    
      super();
    
      this.parser = new Parser();
      this.symbolTable = new SymbolTable();
      
      this.visitAssignmentNode = this.visitAssignmentNode.bind(this);
      this.visitBinaryOpNode = this.visitBinaryOpNode.bind(this);
      this.visitVariableNode = this.visitVariableNode.bind(this);
      this.visitNumberNode = this.visitNumberNode.bind(this);
    }
    
    input(input) {
      if (!input) return '';
      this.parser.receiveNewInput(input);
      let ast = this.parser.parse();
      return this.visit(ast);
    }
    
    visitAssignmentNode(node) {
      let varName = node.token.value;
      let value = this.visit(node.expr);
      this.symbolTable.set(varName, value);
      return value;
    }
    
    visitBinaryOpNode(node) {
    
      let lValue = this.visit(node.left);
      let rValue = this.visit(node.right);
      
      switch (node.token.type) {
        case Token.PLUS:
          return lValue + rValue;
        case Token.MINUS:
          return lValue - rValue;
        case Token.MUL:
          return lValue * rValue;
        case Token.DIV:
          return lValue / rValue;
        case Token.MOD:
          return lValue % rValue;
      }
    }
    
    visitVariableNode(node) {
      let varName = node.token.value;
      return this.symbolTable.get(varName);
    }
    
    visitNumberNode(node) {
      return node.token.value;
    }
    
  }