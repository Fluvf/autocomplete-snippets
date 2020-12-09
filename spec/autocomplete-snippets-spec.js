describe('AutocompleteSnippets', () => {
  beforeEach(() => {
    atom.config.set('autocomplete-plus.enableAutoActivation', true)
    this.completionDelay = 100
    atom.config.set('autocomplete-plus.autoActivationDelay', this.completionDelay)
    this.completionDelay += 100 // Rendering delay

    const workspaceElement = atom.views.getView(atom.workspace)
    jasmine.attachToDOM(workspaceElement)

    let autocompleteSnippetsMainModule = null

    waitsForPromise(() =>
      Promise.all([
        atom.workspace.open('sample.js').then(editor => {
          this.editor = editor
          this.editorView = atom.views.getView(editor)
        }),

        atom.packages.activatePackage('language-javascript'),
        atom.packages.activatePackage('autocomplete-snippets')
          .then(({ mainModule }) => (autocompleteSnippetsMainModule = mainModule)),

        atom.packages.activatePackage('autocomplete-plus'),
        atom.packages.activatePackage('snippets')
          .then(({ activationPromise }) => activationPromise)
          .then(() => atom.packages.getActivePackage('snippets').mainModule
            .snippets().snippetsByPackage().get('language-javascript'))
      ])
    )

    waitsFor('snippets provider to be registered', 1000, () => autocompleteSnippetsMainModule.provider != null)
  })

  describe('when autocomplete-plus is enabled', () => {
    it('shows autocompletions when there are snippets available', () => {
      runs(() => {
        expect(this.editorView.querySelector('.autocomplete-plus')).not.toExist()

        this.editor.moveToBottom()
        this.editor.insertText('D')
        this.editor.insertText('o')

        advanceClock(this.completionDelay)
      })

      waitsFor('autocomplete view to appear', 1000, () => this.editorView.querySelector('.autocomplete-plus span.word'))

      runs(() => {
        expect(this.editorView.querySelector('.autocomplete-plus span.word')).toHaveText('do')
        expect(this.editorView.querySelector('.autocomplete-plus span.right-label')).toHaveText('do')
      })
    })

    it('expands the snippet on confirm', () => {
      runs(() => {
        expect(this.editorView.querySelector('.autocomplete-plus')).not.toExist()

        this.editor.moveToBottom()
        this.editor.insertText('D')
        this.editor.insertText('o')

        advanceClock(this.completionDelay)
      })

      waitsFor('autocomplete view to appear', 1000, () => this.editorView.querySelector('.autocomplete-plus span.word'))

      runs(() => {
        atom.commands.dispatch(this.editorView, 'autocomplete-plus:confirm')
        expect(this.editor.getText()).toContain('} while (true)')
      })
    })
  })
})
