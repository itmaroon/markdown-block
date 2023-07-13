const TocRender = ({ attributes, style }) => {
  return (
    <div className="toc_section">
      <h2>
        Table of Content
        <div className="btn_open"></div>
      </h2>

      <ul style={style}>
        {attributes
          .filter(attr => attr[0] === "itmar/design-title")
          .map(attribute => {
            // Get the level from the headingType.
            const level = attribute[1].headingType.slice(1);
            return (
              <li>
                <a key={attribute[1].headingID} href={`#${attribute[1].headingID}`} className={`lv-${level}`}>
                  {attribute[1].headingContent}
                </a>
              </li>
            );
          }

          )}
      </ul>

    </div>
  );
};

export default TocRender;