// Paste the deployed Google Apps Script Web App /exec URL below after deployment.
// Example: https://script.google.com/macros/s/AKfycb.../exec
const SOLUVIEW_FORMS_ENDPOINT = 'https://script.google.com/macros/s/AKfycbzVMOkgc7UzavujdDzEA8mNfj-_xloobxPkzNymhntO1OWaJsCI_fZgP3IlnbqaLcJDOA/exec'

document.addEventListener('DOMContentLoaded', () => {
  const forms = document.querySelectorAll('[data-soluview-form]')
  if (!forms.length) return

  const setStatus = (form, type, message) => {
    const status = form.querySelector('.form-status')
    status.className = `form-status ${type}`
    status.textContent = message
  }

  forms.forEach(form => {
    form.addEventListener('submit', event => {
      event.preventDefault()
      if (!form.reportValidity()) return
      if (!SOLUVIEW_FORMS_ENDPOINT) {
        setStatus(form, 'error', 'Form delivery is not configured yet. Add the deployed Google Apps Script /exec URL in solutions-form.js.')
        return
      }

      const submitButton = form.querySelector('[type="submit"]')
      submitButton.disabled = true
      submitButton.textContent = 'Sending…'
      setStatus(form, 'notice', 'Sending your message securely…')

      const iframeName = `soluview-form-${Date.now()}-${Math.random().toString(36).slice(2)}`
      const iframe = document.createElement('iframe')
      iframe.name = iframeName
      iframe.className = 'form-transport'
      iframe.setAttribute('aria-hidden', 'true')
      iframe.src = 'about:blank'

      const originalTarget = form.target
      const originalAction = form.action
      form.target = iframeName
      form.action = SOLUVIEW_FORMS_ENDPOINT

      let completed = false
      let submitted = false
      const timeout = window.setTimeout(() => finish('error', 'The request timed out. Please try again.'), 20000)
      const finish = (type, message) => {
        if (completed) return
        completed = true
        window.clearTimeout(timeout)
        form.target = originalTarget
        form.action = originalAction
        submitButton.disabled = false
        submitButton.textContent = form.dataset.submitLabel || 'Send message'
        setStatus(form, type, message)
        window.removeEventListener('message', receiveResponse)
        iframe.removeEventListener('load', receiveLoad)
        window.setTimeout(() => iframe.remove(), 1000)
      }
      const receiveResponse = response => {
        if (response.source !== iframe.contentWindow) return
        const data = response.data
        if (!data || typeof data !== 'object' || !data.result) return
        if (data.result === 'success') {
          form.reset()
          finish('success', form.dataset.successMessage || 'Thank you. Your message has been received.')
        } else {
          finish('error', data.error || 'We could not save your message. Please try again.')
        }
      }
      const receiveLoad = () => {
        // The first load is the iframe's blank document. Submit only after that
        // iframe is ready; the next load is the completed Apps Script POST response.
        if (!submitted) {
          submitted = true
          form.submit()
          return
        }
        window.setTimeout(() => {
          finish('success', form.dataset.successMessage || 'Thank you. Your message has been received.')
          form.reset()
        }, 100)
      }
      window.addEventListener('message', receiveResponse)
      iframe.addEventListener('load', receiveLoad)
      document.body.appendChild(iframe)
    })
  })
})