'use strict'

// @ts-ignore
const Audit = require('lighthouse').Audit

// @ts-ignore
import * as fs from "fs"

// @ts-ignore
const storageFolder = __dirname + '/../../../storage/municipality'

// @ts-ignore
const allowedFontsFile = 'allowedFonts.json'

// @ts-ignore
const allowedFonts = require(storageFolder+ '/' + allowedFontsFile)

// @ts-ignore
class LoadAudit extends Audit {
    static get meta() {
        return {
            id: 'municipality-ux-ui-consistency-fonts-check',
            title: 'Font in pagina',
            failureTitle: 'Non sono presenti alcuni font richiesti',
            scoreDisplayMode: Audit.SCORING_MODES.BINARY,
            description: "Test per verificare l'utilizzo di font validi",
            requiredArtifacts: ['fontsCheck']
        }
    }

    static async audit(artifacts: any) : Promise<{ score: number, details: LH.Audit.Details.Table }> {
        const fonts = artifacts.fontsCheck
        const fontsSplitted = fonts.split(', ')

        let score = 0
        const headings = [
            { key: 'font_in_page', itemType: 'text', text: "Font utilizzati" },
            { key: 'allowed_fonts', itemType: 'text', text: "Font richiesti" }
        ]

        let allowedFontsPrint = ''
        allowedFonts.fonts.forEach((font: string) => {
            allowedFontsPrint += font.replace('"','')
        })

        let cleanFontsSplitted: Array<string> = []
        fontsSplitted.forEach((font: string) => {
            let cleanFont = font.replaceAll('"','')
            cleanFontsSplitted.push(cleanFont)
        })

        const checker = (arr: Array<string>, target: Array<string>) => target.every(v => arr.includes(v))
        if (checker(cleanFontsSplitted, allowedFonts.fonts)) {
            score = 1
        }

        return {
            score: score,
            details: Audit.makeTableDetails(headings, [{font_in_page: fonts.replaceAll('"', ''), allowed_fonts: allowedFontsPrint}])
        }
    }
}

module.exports = LoadAudit