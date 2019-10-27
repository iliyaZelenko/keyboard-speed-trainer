export function removeSelection () {
  if (window.getSelection) {
    if (window.getSelection().empty) { // Chrome
      window.getSelection().empty()
    } else if (window.getSelection().removeAllRanges) { // Firefox
      window.getSelection().removeAllRanges()
    }
  } else if (document.selection) { // IE?
    document.selection.empty()
  }
}

export function placeCaretAtEnd (el) {
  let range, selection

  if (document.createRange) {
    range = document.createRange() // Create a range (a range is a like the selection but invisible)
    range.selectNodeContents(el) // Select the entire contents of the element with the range
    range.collapse(false) // collapse the range to the end point. false means collapse to end rather than the start
    selection = window.getSelection()// get the selection object (allows you to change selection)
    selection.removeAllRanges() // remove any selections already made
    selection.addRange(range) // make the range you have just created the visible selection
  } else if (document.selection) {
    range = document.body.createTextRange() // Create a range (a range is a like the selection but invisible)
    range.moveToElementText(el) // Select the entire contents of the element with the range
    range.collapse(false) // collapse the range to the end point. false means collapse to end rather than the start
    range.select() // Select the range (make it the visible selection
  }
}

export function getCaretPosition (editableDiv) {
  var caretPos = 0
  var sel; var range
  if (window.getSelection) {
    sel = window.getSelection()
    if (sel.rangeCount) {
      range = sel.getRangeAt(0)
      if (range.commonAncestorContainer.parentNode === editableDiv) {
        caretPos = range.endOffset
      }
    }
  } else if (document.selection && document.selection.createRange) {
    range = document.selection.createRange()
    if (range.parentElement() === editableDiv) {
      var tempEl = document.createElement('span')
      editableDiv.insertBefore(tempEl, editableDiv.firstChild)
      var tempRange = range.duplicate()
      tempRange.moveToElementText(tempEl)
      tempRange.setEndPoint('EndToEnd', range)
      caretPos = tempRange.text.length
    }
  }
  return caretPos
}

export function setCaretPos (el, pos) {
  const range = document.createRange()
  const sel = window.getSelection()

  range.setStart(el.firstChild, pos)
  range.collapse(true)
  sel.removeAllRanges()
  sel.addRange(range)
}

export function setSelectionRange (el, start, end) {
  if (document.createRange && window.getSelection) {
    var range = document.createRange()
    range.selectNodeContents(el)
    var textNodes = getTextNodesIn(el)
    var foundStart = false
    var charCount = 0; var endCharCount

    // eslint-disable-next-line no-cond-assign
    for (var i = 0, textNode; textNode = textNodes[i++];) {
      endCharCount = charCount + textNode.length
      if (!foundStart && start >= charCount && (start < endCharCount || (start === endCharCount && i <= textNodes.length))) {
        range.setStart(textNode, start - charCount)
        foundStart = true
      }
      if (foundStart && end <= endCharCount) {
        range.setEnd(textNode, end - charCount)
        break
      }
      charCount = endCharCount
    }

    var sel = window.getSelection()
    sel.removeAllRanges()
    sel.addRange(range)
  } else if (document.selection && document.body.createTextRange) {
    var textRange = document.body.createTextRange()
    textRange.moveToElementText(el)
    textRange.collapse(true)
    textRange.moveEnd('character', end)
    textRange.moveStart('character', start)
    textRange.select()
  }
}

function getTextNodesIn (node) {
  var textNodes = []
  if (node.nodeType === 3) {
    textNodes.push(node)
  } else {
    var children = node.childNodes
    for (var i = 0, len = children.length; i < len; ++i) {
      textNodes.push.apply(textNodes, getTextNodesIn(children[i]))
    }
  }
  return textNodes
}
