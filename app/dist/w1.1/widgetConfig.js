var widgetConfig = {
    title: 'Diamond Story',
    pages: [
        {
            title:  'Light',
            code:   'light',
            enableStoryline: true
        },
        {
            title:  'Loupe',
            code:   'loupe'
        },
        {
            title:  'Summary',
            code:   'summary',
            specs: [
                [
                    {text: 'slide.summary.text6', sarineInfoField: 'stoneProperties.GIA'},
                    {text: 'slide.summary.text1', sarineInfoField: 'friendlyName'}
                ],
                [
                    {popupId: 'popup_color', text: 'slide.summary.text2', sarineInfoField: 'stoneProperties.color'},
                    {popupId: 'popup_clarity', text: 'slide.summary.text3', sarineInfoField: 'stoneProperties.clarity'},
                    {popupId: 'popup_cut', text: 'slide.summary.text4', sarineInfoField: 'stoneProperties.cutGrade'},
                    {popupId: 'popup_carat', text: 'slide.summary.text5', sarineInfoField: 'stoneProperties.carat'}
                ]
            ]
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
    styles: {
        brandColor: "orange",
//        summaryLabel: {
//            "font-family": "Arial",
//            "font-size": "15px",
//            color: "red"
//        },
//        summaryValue: {
//            "font-family": "Times New Roman",
//            "font-size": "18px",
//            color: "green"
//        },
//        summaryNav: {
//            "font-family": "Tahoma",
//            "font-size": "22px",
//            color: "#ff00ff"
//        },
//        conditions: {
//            "font-family": "Tahoma",
//            "font-size": "14px",
//            color: "darkblue"
//        },
//        poweredBy: {
//            "font-family": "Tahoma",
//            "font-size": "18px",
//            color: "blue"
//        }
    }
};
