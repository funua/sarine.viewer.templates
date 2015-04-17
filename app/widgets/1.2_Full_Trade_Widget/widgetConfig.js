var widgetConfig = {
    title: 'Diamond story',
    
    // TODO: implement this
    color_scheme: 'color-scheme-1',
    
    pages: [
        {
            title:  'Real view',
            code:   'summary',
//            disableNavigation: true,
            // TODO: implement this functionality
            enableStoryline: true
        },
        {
            title:  'Light',
            code:   'light'
        },
        {
            title:  'Loupe',
            code:   'loupe'
        },
        {
            title:  'Hearts & Arrows',
            code:   'hna'
        },
        {
            title:  'Cut',
            code:   'cut'
        }
    ],
    
    customer_logo: {
        img: '/img/tmp_igi_logo.png',
        href: 'http://google.com',
        title: 'My logo ittle'
    }
    // or: customer_logo: false to hide it
};
