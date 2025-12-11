import { useState } from 'react'
import { useTranslation } from 'react-i18next'

// quick and dirty formatter to pretty print small xml snippets
function quickFmtXML(xml: string) {
  // Use a regex to add line breaks and indentation
  const lines = xml.split(/(?=<)/g)
  let result = ''
  for (let ind = 0, i = 0; i < lines.length; i++) {
    const item = lines[i].trim()
    if (item.startsWith('</')) {
      ind--
    }
    result += '  '.repeat(ind) + item + '\n'
    if (item.endsWith('/>') == false) {
      ind++
    }
  }
  return result
}

// parses Locations xml and returns a list of json objects with id,href fields
function parseLocations(xml: string) {
  const parser = new DOMParser()
  // parse the xml given as dom elements
  const locXML = parser.parseFromString(xml, 'text/xml')
  // query xml dom elements by location tag and keep only the href,id values
  return Array.from(locXML.getElementsByTagName('location')).map((x) => ({
    href: x.getAttribute('href'),
    id: x.getAttribute('id'),
  }))
}

// View Locations XML values
const Locations = ({xml}:{xml: string}) => {
  const { t } = useTranslation();
  // default view is not the xml
  const [viewXML, setViewXML] = useState(false)
  let btnMsg = t("btn_xml");
  let content = null
  const prettyXML = quickFmtXML(xml)
  const parsedLocations = parseLocations(xml)

  if (viewXML) {
    btnMsg = t("btn_location");
    content = <code>{prettyXML}</code>
  } else {
    const items = []
    for (const loc of parsedLocations) {
      items.push(
        <li key={loc.id}>
          <span>
            🔗 {loc.id} -{' '}
            <a target="_blank" href={loc.href || ""}>
              {loc.href}
            </a>
          </span>
        </li>,
      )
    }
    content = <ul className="location-list">{items}</ul>
  }

  return (
    <div>
      {content}
      <div className="text-right">
        <button
          className="btn btn-sm"
          onClick={() => {
            setViewXML(!viewXML)
          }}
        >
          {btnMsg}
        </button>
      </div>
    </div>
  )
}

export { Locations }
