var widgetConfig = {
    title: 'Diamond22 story',
    color: {
        main: '#aaa',
        // may be added other colors:
        background: '#ccc'
    },
    color_scheme: 'color-scheme-1',
    pages: [
        {
            title:  'Real view',
            code:   'summary',
//            disableNavigation: true,
            
            // TODO: implement this functionality
            enableStoryline: true,
        },
        {
            title:  'Hearts & Arrows',
            code:   'hna'     },
        {
            title:  'Loupe',
            code:   'loupe'
        },
//        {
//            title:  'Light',
//            code:   'light'
//        },
    ],
    // other template-specific fields
    show_IGI_logo: true
};
