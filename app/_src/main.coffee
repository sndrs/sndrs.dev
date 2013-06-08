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
  $('[data-fancy-content]').click (e) -> 
    e.preventDefault() 
    $.fancybox($("##{$(@).data('fancy-content')}").children().map( -> 
      $this = $(this)
      href: $this.data('src')
      title: $this.attr('alt')
    ).toArray(), {
      loop: false
      openEffect: 'fade'
      closeEffect: 'fade'
      nextEffect: 'elastic'
      prevEffect: 'elastic'
      caption: 
        type: 'inside'
      theme: 'light'        
    })





