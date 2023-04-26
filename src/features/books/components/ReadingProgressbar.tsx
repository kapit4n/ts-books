interface ReadingProgressBarProps {
  completed: number;
}

const ReadingProgressBar = (props: ReadingProgressBarProps) => {
  const { completed } = props;

  const color = completed < 30? "#E7F392" : (completed < 70? '#CC8627': "#59DD63");

  const styles: { [key: string]: React.CSSProperties } = {
    containerStyles: {
      height: 20,
      width: '100%',
      backgroundColor: "#e0e0de",
      borderRadius: 50,
    },

    fillerStyles: {
      height: '100%',
      width: `${completed}%`,
      backgroundColor: color,
      borderRadius: 'inherit',
      textAlign: 'right'
    },

    labelStyles: {
      padding: 5,
      color: 'white',
      fontWeight: 'bold'
    }
  }

  return (
    <div style={styles.containerStyles}>
      <div style={styles.fillerStyles}>
        <span style={styles.labelStyles}>{`${completed}%`}</span>
      </div>
    </div>
  );
};

export default ReadingProgressBar