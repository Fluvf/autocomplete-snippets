module.exports = class AutocompleteSnippets {
  static #firstChar = (string) => {
    // (Try to) Support Surrogate pairs and Diacritical marks and other Unicode weirdness
    return [...string.normalize().toLocaleLowerCase()].shift()
  }

  static #snippets

  static selector = '*'
  static inclusionPriority = 1
  static suggestionPriority = 2
  static filterSuggestions = true

  static provide () {
    return this
  }

  static snippets (service) {
    this.#snippets = service
    return { dispose: () => { this.#snippets = null } }
  }

  static getSuggestions ({ scopeDescriptor, prefix }) {
    return this.#snippets != null
      // Get all snippets for given scope as an array
      ? Object.entries(this.#snippets.snippetsByScopes()
          .getPropertyValue(scopeDescriptor.getScopeChain()) || {})
          // Convert snippets into suggestion objects
          .flatMap(([rightLabel, { body: snippet, prefix: displayText, ...rest }]) =>
            // Filter out snippets that don't have matching prefixes
            this.#firstChar(displayText) === this.#firstChar(prefix)
              ? Object.assign({ snippet, displayText, type: 'snippet', rightLabel }, rest)
              : [])
      : []
  }
}
