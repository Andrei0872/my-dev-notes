
function textDiff(s1, s2, split_by_words) {
    let lcs;
    
    if(split_by_words) {
        let regex = /([ .,])/g;
        split_1 = s1.split(regex);
        split_2 = s2.split(regex);
        console.log(split_1)
        console.log(split_2)
        lcs = LCS(split_1, split_2);
    } else {
        lcs = LCS(s1,s2);
    }
    
    console.log(lcs)
    let result1 = [], // Deleted 
        result2 = []; // Added
    let i;
    let index_1 = 0 , index_1_next = 0;
    let index_2 = 0 , index_2_next = 0;

    for(i = 0; i < lcs.length; i++) {
        let currentChar = lcs[i];
        index_1_next = s1.indexOf(currentChar, index_1);
        index_2_next = s2.indexOf(currentChar, index_2);
        
        // I am waiting for snow',"I've been waiting for snow"
        console.log(index_1_next)
        console.log(index_2_next)
        
        pushToArray(result1, s1.substring(index_1, index_1_next),'deleted');
        pushToArray(result2, s2.substring(index_2, index_2_next),'added');
        pushToArray(result1, currentChar);
        pushToArray(result2, currentChar);

        index_1 = index_1_next + 1;
        index_2 = index_2_next + 1;
    }
    // Get the remaining part
    pushToArray(result1, s1.substring(index_1), 'deleted');
    pushToArray(result2, s2.substring(index_2), 'added');

    return {
        lcs: lcs,
        deleted: result1.join``,
        added: result2.join``
    }

}

function pushToArray(arr, string, className) {
    if(!string)
        return;
    
    if(className) {
        arr.push(`<span class=${className}>${string}</span>`);
    } else {
        // Common part
        arr.push(string);
    }
}

/**
 * Longest Common Subsequence
 * 
 * @param {array || string} item1 
 * @param {array || string} item2 
 */
function LCS(item1, item2) {
    let memo = [...Array(item1.length)].map(item => [...Array(item2.length)])
    return helper(item1, item2, 0,0, memo);
}


/**
 * The actual implementation of LCS 
 */
function helper(item1, item2, index_1, index_2, memo) {

    if(index_1 === item1.length || index_2 === item2.length )
        return '';
    
    if(memo[index_1][index_2] !==  undefined) 
        return memo[index_1][index_2];
    
    if(item1[index_1] === item2[index_2]) {
        return  memo[index_1][index_2] = item1[index_1] + helper(item1, item2, index_1 + 1, index_2 + 1, memo);
    }

    let str1 = helper(item1, item2, index_1 + 1, index_2, memo);
    let str2 = helper(item1, item2, index_1, index_2 + 1, memo);

    return memo[index_1][index_2] = str1.length > str2.length ? str1 : str2;

}
