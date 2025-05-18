this.parse = inputStr => {
    if (_parseTable === undefined) {
      return;
    }
    _parseSteps = [];
    if (_parseTableHasConflict) {
      _parseSteps.push({
        stateStack: [],
        symbolStack: [],
        input: [],
        action: {
          type: 'error',
          error: 'conflict in parse table'
        }
      });
      return;
    }
    let input = scan(inputStr);
    if (input === false) {
      _parseSteps.push({
        stateStack: [],
        symbolStack: [],
        input: [],
        action: {
          type: 'error',
          error: 'syntax error'
        }
      });
      return;
    }
    let stateStack = [0];
    let symbolStack = [];
    while (true) {
      let action = _parseTable[top(stateStack)][input[0]];
      if (action === undefined) {
        action = {
          type: 'error',
          error: 'parse error'
        };
      }

      _parseSteps.push({
        stateStack: stateStack.slice(0),
        symbolStack: symbolStack.slice(0),
        input: input.slice(0),
        action: action
      });
      switch (action.type) {
        case 'shift':
          symbolStack.push(input.shift());
          stateStack.push(action.state);
          break;
        case 'reduce':
          for (let i = 0; i < action.rule.rhs.length; ++i) {
            symbolStack.pop();
            stateStack.pop();
          }
          symbolStack.push(action.rule.lhs);
          stateStack.push(_parseTable[top(stateStack)][action.rule.lhs]);
          break;
        case 'accept':
        case 'error':
          return;
      }
    }
  };





  this.renderParseSteps = container => {
    container.innerHTML = '';
    if (_parseSteps === undefined) {
      return;
    }
    let tableNode = document.createElement('table');
    let theadNode = document.createElement('thead');
    tableNode.appendChild(theadNode);
    let theadTrNode = document.createElement('tr');
    theadNode.appendChild(theadTrNode);
    let tbodyNode = document.createElement('tbody');
    tableNode.appendChild(tbodyNode);
    theadTrNode.appendChild(element('th', 'state stack'));
    theadTrNode.appendChild(element('th', 'symbol stack'));
    theadTrNode.appendChild(element('th', 'input'));
    theadTrNode.appendChild(element('th', 'action'));
    theadTrNode.appendChild(element('th', 'output'));
    _parseSteps.forEach(step => {
      let trNode = document.createElement('tr');
      tbodyNode.appendChild(trNode);
      trNode.appendChild(element('td', document.createTextNode(step.stateStack.join(' '))));
      trNode.appendChild(element('td', symbolsNodes(step.symbolStack)));
      trNode.appendChild(element('td', symbolsNodes(step.input)));
      trNode.appendChild(element('td', actionStr(step.action), step.action.type));
      trNode.appendChild(element('td',
        step.action.type === 'reduce' ?
          ruleNodes(step.action.rule) :
          undefined
      ));
    });
    container.appendChild(tableNode);
  };

  this.renderParseTree = container => {
    container.innerHTML = '';
    if (_parseSteps === undefined) {
      return;
    }
    let ulNode = treeNode(getParseTree());
    if (ulNode !== undefined) {
      container.appendChild(ulNode);
    }
  };

  const getParseTree = () => {
    let tree;
    for (let i = _parseSteps.length - 1; i >= 0; --i) {
      if (_parseSteps[i].action.type === 'reduce') {
        if (tree === undefined) {
          tree = {
            symbol: _parseSteps[i].action.rule.lhs,
            children: []
          };
        }
        addRuleToParseTree(tree, _parseSteps[i].action.rule);
      }
    }
    return tree;
  };
