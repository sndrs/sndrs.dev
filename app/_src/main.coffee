# shim layer with setTimeout fallback
window.requestAnimFrame = do ->
  window.requestAnimationFrame or 
  window.webkitRequestAnimationFrame or 
  window.mozRequestAnimationFrame or 
  window.oRequestAnimationFrame or 
  window.msRequestAnimationFrame or 
  (callback) -> window.setTimeout callback, 1000 / 60

$ ->
  $('#works').timeline()
  $('[data-fancy-content]').click (e) -> 
    e.preventDefault() 
    $.fancybox($("##{$(@).data('fancy-content')}").children().map(-> href: $(this).data('src')),{
      loop: false, 
      nextEffect: 'fade'
    })
  $('.fancybox-media').fancybox({
    helpers : {
      media : {}
    }
  })





