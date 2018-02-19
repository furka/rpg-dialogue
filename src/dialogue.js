export default class Dialogue {
  //create a new Dialogue tree from html data
  //see documentation for how to construct html
  constructor(html) {
    this.template = document.createElement("template")
    this.template.innerHTML = html
    this.template = this.template.content

    this.currentOptions = []
  }

  //interact with the dialogue
  interact(id, CONDITIONS, ACTIONS) {
    id = Dialogue.parseID(id)

    let element

    if (id === null) {
      element = Array.from(this.current.childNodes).filter(
        node => node.nodeType === node.ELEMENT_NODE
      )[0]
    } else {
      element = this.template.getElementById(id)
    }

    this.current = element

    const text = Dialogue.getText(this.current)

    let responses = Dialogue.getOptions(this.current)
    responses = this.validateOptions(responses)
    responses = Dialogue.conditionOptions(responses, CONDITIONS)

    if (responses.length === 1) {
      responses[0].text = null
    }

    this.triggerActions(id, ACTIONS)
    this.currentOptions = responses

    if (!text && responses.length === 0) {
      throw new Error("Dialogue Error - dead end")
    }

    return {
      text: text,
      responses: responses
    }
  }

  //triggers actions for the current interaction
  triggerActions(id, ACTIONS) {
    if (!ACTIONS) {
      return
    }

    let actions = this.currentOptions
      .filter(option => option.id === id)
      .map(option => option.action)

    actions.push(this.current.getAttribute("then"))

    actions
      .map(action => ACTIONS[action]) //map to functions
      .filter(action => typeof action === "function") //filter non-functions
      .filter((action, i, list) => list.indexOf(action) === i) //filter duplicates
      .forEach(action => action()) //trigger actions
  }

  //removes invalid options from a list of options
  validateOptions(list) {
    return list.filter(option => {
      if (option.id === null && Dialogue.hasChildOptions(this.current)) {
        return true
      } else if (this.template.getElementById(option.id)) {
        return true
      } else {
        console.warn("Invalid dialogue option", option)
      }
    })
  }

  //removes options from a list of options that don't meet their condition
  static conditionOptions(list, CONDITIONS) {
    if (!CONDITIONS) {
      return list
    }

    return list.filter(option => {
      if (!option.condition) {
        return true
      }

      const inverse = /^!/.test(option.condition)
      let condition = option.condition.replace(/^!/, "")
      condition = CONDITIONS[condition]
      if (typeof condition === "function") {
        condition = condition()
      }

      if (inverse) {
        return !condition
      } else {
        return condition
      }
    })
  }

  //parse an ID, making sure it's a number or null
  static parseID(id) {
    id = parseInt(id, 10)

    if (Number.isNaN(id)) {
      id = null
    }

    return id
  }

  //checks whether a node has options
  static hasChildOptions(node) {
    return (
      Array.from(node.childNodes).filter(
        node => node.nodeType === node.ELEMENT_NODE
      ).length > 0
    )
  }

  //returns the available options from a node
  static getOptions(node) {
    const options = Array.from(node.childNodes)
      .filter(node => node.nodeType === node.ELEMENT_NODE)
      .map(node => {
        return {
          id: Dialogue.parseID(node.id || node.getAttribute("next")),
          text: Dialogue.getText(node),
          condition: node.getAttribute("if") || null,
          action: node.getAttribute("then") || null
        }
      })

    return options
  }

  //returns the text of a node, ignoring its children
  static getText(node) {
    return Array.from(node.childNodes).reduce((text, val) => {
      return text + (val.nodeType === val.TEXT_NODE ? val.textContent : "")
    }, "")
  }
}
