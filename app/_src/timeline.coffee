# Registers as a jQuery plugin, but not really ready for release. One day maybe...

do ($ = jQuery) ->

  $.fn.timeline = (options) ->
    # At the moment, just not going to do it on small screens - not sure it's useful there.
    if $('#timelines').is(":visible")
      $document = $(document)
      $window = $(window)
      documentHeight = windowHeight = null
      updatingTimeline = resizing = false

      defaults =
        startDate: Date.now()/ 1000 / 60 / 60 / 24
        minHeight: 2
        colours: ['00A9FF', 'FFDC1D', '00FFBC', 'F20062', 'A7FF43'] #https://kuler.adobe.com/sndrs-color-theme-2510717/

      settings = $.extend defaults, options

      @each ->
        $this = $(this)

        # Work out where the events list is on the page
        thisTop = $this.offset().top

        # Get a list of the entry elements
        $events = $this.find('.entry')
        
        # Work out how long the timeline is, based on the text in the `<time>` elements.
        # Assumes $events elements are already ordered, recent first and that they will all contain at least a .start element.        
        $firstEvent = $events.first()
        @endDate = new Date $firstEvent.find('.end').data('date') ? $firstEvent.find('.start').data('date')
        @startDate = new Date $events.last().find('.start').data('date')
        timelineDuration = (Date.parse(@endDate) - Date.parse(@startDate)) / 1000 / 60 / 60 / 24

        # Generate each '$timelineEvent' from the list of '$events'
        timelineEvents = $.map $events, (event, i) ->
          $event = $(event)
          $start = $event.find('.start')
          $end = $event.find('.end')

          data =           
            startDate: Math.round Date.parse($start.data('date')) / 1000 / 60 / 60 / 24
            endDate: Math.round Date.parse($end.data('date')) / 1000 / 60 / 60 / 24 unless $end.length is 0
            eventEl: $event
            highlight: "##{settings.colours[i%settings.colours.length]}"

          top = Math.floor (settings.startDate - (data.endDate ? data.startDate)) / timelineDuration * 100
          bottom = 100 - Math.floor (settings.startDate - data.startDate) / timelineDuration * 100
          $("<a id='tl_#{$event.attr 'id'}' class='timeline-event' />").data(data).css(
            "top": "#{top}%"
            "bottom": "#{Math.min bottom, 99 - top}%" if data.endDate? 
            "height": "#{settings.minHeight}px" unless data.endDate? 
            zIndex: 1
          )

        $('#timelines').append timelineEvents

        # Call this onload to handle the late arrival of fonts.
        $window.load -> getPositions()

        # Update all the element positions, throttled to wait 100ms after event fires or start again.
        $window.resize ->
          clearTimeout resizing if resizing
          resizing = setTimeout getPositions, 100

        # Bind to scroll
        $window.bind 'scroll.timeline', ->     
          unless updatingTimeline
            updatingTimeline = true
            requestAnimFrame updateTimeline


        # store the position of the elements needed to update the timeline.
        getPositions = (callback) ->
          documentHeight = $document.height()
          windowHeight = $window.height()

          for $timelineEvent in timelineEvents          
            $event = $timelineEvent.data('eventEl')
            top = Math.round $event.offset().top
            $timelineEvent.data 'eventTop', top
            $timelineEvent.data 'eventBottom', top + $event.outerHeight()

            top = Math.round $timelineEvent.offset().top - $window.scrollTop()
            $timelineEvent.data 'top', top
            $timelineEvent.data 'bottom', top + $timelineEvent.outerHeight(true)

          updateTimeline()

        updateTimeline = ->
          scrollTop = $window.scrollTop()  

          if scrollTop >= 0 and scrollTop <= documentHeight - windowHeight
            for $timelineEvent in timelineEvents
              do ($timelineEvent) ->
                data = $timelineEvent.data()
                hightlighted = $timelineEvent.css('zIndex') isnt '1'
                if data.top + scrollTop >= data.eventTop and data.bottom + scrollTop <= data.eventBottom
                  if not hightlighted
                    data.bgColor = data.eventEl.css 'background-color'
                    $timelineEvent.css 
                      'background-color': data.highlight
                      zIndex: 100
                    data.eventEl.css 
                      'border-color': data.highlight
                else if hightlighted
                  $timelineEvent.css 
                    'background-color': data.bgColor
                    zIndex: 1
                  data.eventEl.css 
                    'border-color': data.bgColor

          updatingTimeline = false    
