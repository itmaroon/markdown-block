const TocRender = ({ attributes }) => {
  console.log(attributes);
  return (
    <div className="toc_section">
      <h1>Table of content</h1>
      {attributes
        .filter(attr => attr[0] === "itmar/design-title")
        .map(attribute => {
          // Get the level from the headingType.
          const level = attribute[1].headingType.slice(1);
          return (
            <a key={attribute[1].headingID} href={`#${attribute[1].headingID}`} className={`lv-${level}`}>
              {attribute[1].headingContent}
            </a>
          );
        })}
    </div>
  );
};

export default TocRender;