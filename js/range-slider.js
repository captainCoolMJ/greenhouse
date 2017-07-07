const rangeSlider = (selector) => {
    const initialValues = [ 5, 20 ]

    this.setSliderLabels = (fromValue, toValue) => {
        if(Array.isArray(fromValue)) {
            toValue = fromValue[1]
            fromValue = fromValue[0]
        }
        const fromRanger = $(selector).find('span')[0]
        const toRanger = $(selector).find('span')[1]
        $(fromRanger).children().remove()
        $(toRanger).children().remove()
        $(fromRanger).html(`<i>${fromValue}</i>`)
        $(toRanger).html(`<i>${toValue}</i>`)
    }
    $(selector).slider({
        range: true,
        min: 0,
        max: 23,
        values: initialValues,
        slide: ( event, ui ) => {
            const fromValue = `${ui.values[0]}:00`
            const toValue = `${ui.values[1]}:00`
            this.setSliderLabels(fromValue, toValue)
            $(`${selector}-from`).val(fromValue)
            $(`${selector}-to`).val(toValue)
        }
    })
    this.setSliderLabels(initialValues.map(item => item+':00'))
}

(function($) {
    rangeSlider('#time-range')
})(jQuery)