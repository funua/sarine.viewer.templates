###
Generated from CoffeeScript source
###
$ ->
    onViewersReady = ()->
        $.getJSON(getPath(template) + '/config.json')
        .done (response)->
            processTemplate(response) if typeof response is 'object' and response.pages and response.pages.length
        .always ()->
            $('.loading').hide()
            $('.container').show()

    getPath = (src)->
        arr = src.split '/'
        arr.pop()
        arr.join '/'
    
    ###  Prepare to catch viewers ready state  ###
    totalViewers = $('.viewer').length
    $ 'canvas'
    .each (aCanvas)->
        totalViewers-- if $(aCanvas).hasClass 'no_stone'
    if totalViewers
        $(document).on 'first_init_end', ()->
            totalViewers--
            onViewersReady() if totalViewers <= 0
    else
        onViewersReady()
    
    processTemplate = (dynamicConfig)->
        viewersContainer = $ '.all-viewers'
        tmpContainer = $ '<div/>'
        viewersContainer.find '> .viewer-container'
        .appendTo tmpContainer
        
        for aPage in dynamicConfig.pages
#            console.log 'aPage ->', aPage
            tmpContainer.find('> .' + aPage.viewer)
            .appendTo viewersContainer
        18