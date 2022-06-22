import { NoCopyNoTranslate } from 'app/components/NoCopyNoTranslate'
import { Box, Grid, ResponsiveContext, Text } from 'grommet'
import * as React from 'react'
import { useContext } from 'react'

/**
 *
 * MnemonicGrid
 *
 */
interface WordProp {
  id: number
  word: string
  hidden?: boolean
  higlighted?: boolean
}

const noSelect: React.CSSProperties = {
  WebkitUserSelect: 'none',
  MozUserSelect: 'none',
  msUserSelect: 'none',
  userSelect: 'none',
}

// Make typos obvious e.g. if user has pasted mnemonic containing a newline
const keepWhitespace: React.CSSProperties = {
  whiteSpace: 'pre',
}

function MnemonicWord(props: WordProp) {
  return (
    <Box
      background={props.higlighted ? 'brand' : 'background-contrast'}
      margin="xsmall"
      direction="row"
      pad="xsmall"
      border={{ side: 'bottom' }}
    >
      <Box pad={{ right: 'small' }}>
        <Text style={noSelect}>{props.id}.</Text>
      </Box>
      <Box>
        <NoCopyNoTranslate>
          <strong style={keepWhitespace}>{props.hidden ? '' : props.word}</strong>
        </NoCopyNoTranslate>
      </Box>
    </Box>
  )
}

interface Props {
  // List of words
  mnemonic: string[]

  /** Indexes of hidden words, used for mnemonic validation */
  hiddenWords?: number[]

  /** Highlighted word indexes, used for mnemonic validation */
  highlightedIndex?: number
}

export function MnemonicGrid({ mnemonic, highlightedIndex: hilightedIndex, hiddenWords }: Props) {
  const size = useContext(ResponsiveContext)
  const maxEnglishLength = 8
  const numberDotSpaceLength = 4
  const columnSize =
    size === 'large' ? ['1fr', '1fr', '1fr', '1fr'] : `${maxEnglishLength + numberDotSpaceLength + 2}ch`

  return (
    <NoCopyNoTranslate>
      <Grid columns={columnSize} data-testid="mnemonic-grid">
        {mnemonic.map((word, index) => (
          <MnemonicWord
            key={index + 1}
            id={index + 1}
            word={word}
            higlighted={index === hilightedIndex}
            hidden={hiddenWords && hiddenWords.indexOf(index) !== -1}
          />
        ))}
      </Grid>
    </NoCopyNoTranslate>
  )
}
