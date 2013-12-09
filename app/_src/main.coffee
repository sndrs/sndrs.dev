# shim layer with setTimeout fallback
window.requestAnimFrame = do ->
  window.requestAnimationFrame or
  window.webkitRequestAnimationFrame or
  window.mozRequestAnimationFrame or
  window.oRequestAnimationFrame or
  window.msRequestAnimationFrame or
  (callback) -> window.setTimeout callback, 1000 / 60

$ ->
  $('#entries').timeline()

  $('.lightbox').click (e) ->
    e.preventDefault()
    $this = $(@)
    href = $this.attr('href')
    if href.indexOf('#') is 0
      items = $(href).children().map( ->
        $this = $(@)
        src: $this.data('src')
        title: $this.attr('alt')
        type: $this.attr('type') ? 'image'
      ).toArray()
    else
      items =
        src: href
        type: $this.attr('type') ? 'iframe'
    $.magnificPopup.open
      items: items
      iframe:
        patterns:
          soundcloud:
            index: 'soundcloud.com'
      gallery:
        enabled: true





