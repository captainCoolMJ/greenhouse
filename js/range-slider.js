const rangeSlider = (selector) => {
    const initialValues = [ 5, 20 ]

    this.toString = value => {
        let postfix = (value > Math.floor(value) ? ':30' : ':00' )
        if(Math.ceil(value) === 24) {
            postfix = ':59'
        }
        return Math.floor(value) + postfix
    }

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
        max: 23.9,
        step: .5,
        values: initialValues,
        slide: ( event, ui ) => {
            const fromValue = this.toString(ui.values[0])
            const toValue = this.toString(ui.values[1])
            this.setSliderLabels(fromValue, toValue)
            $(`${selector}-from`).val(fromValue)
            $(`${selector}-to`).val(toValue)
        }
    })
    this.setSliderLabels(initialValues.map(item => this.toString(item)))
}

(function($) {
    rangeSlider('#time-range')
})(jQuery)