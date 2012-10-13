//Recursion rocks

function cloneTree(tree) {
    if (isLeafNode(tree)) return new Tree(tree.op, undefined, undefined);
    return new Tree(tree.op, cloneTree(tree.left), cloneTree(tree.right));
}


//function getIdFromNodes(tree) {
//    var leftLeaves = getLeftLeaves(tree);
//    $(leftLeaves).each(function () {
//        this.op = '$("' + '#' + this.op + '").val()';
//    });
//    return tree;
//}

//function getNameFromNodes(tree) {
//    var leftLeaves = getLeftLeaves(tree);
//    $(leftLeaves).each(function () {
//        this.op = '$("input[name=' + this.op + ']:checked").val()';
//    });
//    return tree;
//}


function getExpressionFromTree(tree) {
    if (isLeafNode(tree)) {
        return tree.op;
    }
    return "(" + "(" + getExpressionFromTree(tree.left) + ")" + tree.op + "(" + getExpressionFromTree(tree.right) + ")" + ")";
}

function getExpressionTree(exp) {
    return get_tree(tokenize(exp));
}

function getEqualityExpressions(tree) {
    var exps = [];
    if (isLeafNode(tree)) {
        return exps;
    }
    if (isLeafNode(tree.left) && isLeafNode(tree.right) && tree.op == '==') {
        return exps.concat(tree);
    }
    if (!isLeafNode(tree.left)) {
        exps = exps.concat(getEqualityExpressions(tree.left));
    }
    if (!isLeafNode(tree.right)) {
        exps = exps.concat(getEqualityExpressions(tree.right));
    }
    return exps;
}

function getLeftLeaves(tree) {
    var leftLeaves = []
    if (isLeafNode(tree)) {
        return leftLeaves.concat(tree);
    }
    if (isLeafNode(tree.left) && isLeafNode(tree.right)) {
        return leftLeaves.concat(getLeftLeaves(tree.left));
    }
    return leftLeaves.concat(getLeftLeaves(tree.left)).concat(getLeftLeaves(tree.right));
}

function isLeafNode(tree) {
    return (tree.left == undefined && tree.right == undefined);
}

/*****************************************************Expression Tree Builder*****************************************************/
///http://snippets.dzone.com/posts/show/4188
function Tree(op, left, right) {
    this.op = op;
    this.left = left;
    this.right = right;
}

function tokenize(s) {
    var r = [];
    var c = "";
    var result = s.split(/(&&|\|\||==|\(|\))/);
    $.each(result, function (i, val) {
        c = val.replace(/ /g, ''); // strip whitespace
        if (c.length < 1)
            return true; // continue for $.each
        r.push(c);
    });
    return r;
}

function get_var(tokens) {
    if (getToken(tokens, '(')) {
        var a = get_tree(tokens);
        getToken(tokens, ')');

        return a;
    } else {
        var aux = tokens[0];
        shift(tokens);

        return new Tree(aux, undefined, undefined);
    }
}

function getToken(tokens, expected) {
    if (tokens[0] == expected) {
        shift(tokens);
        return true;
    }
    return false;
}

function shift(arr) {
    return arr.splice(0, 1);
}

function get_tree(tokens) {
    var a = get_var(tokens);
    var match = /&&|\|\||==/i.exec(tokens[0]);
    if (match !== null) {
        shift(tokens);
        var b = get_tree(tokens);
        return new Tree(match[0], a, b);
    }
    return a;
}

function parse(exp) {
    if (exp.startsWith('datediff')) {
        return 0;
    }
    else {
        return 1;
    }
}

/************************************* Util Functions *************************************/
if (typeof String.prototype.startsWith != 'function') {
    String.prototype.startsWith = function (str) {
        return this.indexOf(str) == 0;
    };
}
