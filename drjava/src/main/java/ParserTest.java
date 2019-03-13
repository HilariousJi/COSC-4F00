import org.antlr.v4.gui.TreeViewer;
import org.antlr.v4.runtime.*;
import org.antlr.v4.runtime.tree.ParseTree;
import org.antlr.runtime.tree.CommonTree;

import java.awt.*;
import java.io.File;
import java.io.IOException;
import javax.swing.*;
import java.util.Arrays;

public class ParserTest {

    public enum Grammar {
        C11, CPP14, Java8
    }

    public ParserTest() throws IOException {

        File cTestFile, cppTestFile, javaTestFile;
        Parser cParser, cppParser, javaParser;
        ParseTree cParseTree, cppParseTree, javaParseTree;

        cTestFile = new File("C:\\Users\\jesse\\OneDrive\\WorkSpace\\COSC-4F00\\drjava\\src\\main\\resources\\HelloWorld.c");
        cppTestFile = new File("C:\\Users\\jesse\\OneDrive\\WorkSpace\\COSC-4F00\\drjava\\src\\main\\resources\\HelloWorld.cpp");
        javaTestFile = new File("C:\\Users\\jesse\\OneDrive\\WorkSpace\\COSC-4F00\\drjava\\src\\main\\resources\\HelloWorld.java");

        cParser = getParser(CharStreams.fromPath(cTestFile.toPath()), Grammar.C11);
        cppParser = getParser(CharStreams.fromPath(cppTestFile.toPath()), Grammar.CPP14);
        javaParser = getParser(CharStreams.fromPath(javaTestFile.toPath()), Grammar.Java8);

        cParseTree = ((CParser) cParser).translationUnit();
        cppParseTree = ((CPP14Parser) cppParser).translationunit();
        javaParseTree = ((Java8Parser) javaParser).compilationUnit();

        displayTree(
                new String[] {"C", "C++", "Java"},
                new Parser[] {cParser, cppParser, javaParser},
                new ParseTree[] {cParseTree, cppParseTree, javaParseTree}
        );


        // TODO - Generate ASTs
        // TODO - Generate Function Graphs

    }

    public void displayTree(String[] titleArr, Parser[] parserArr, ParseTree[] treeArr) {

        JFrame frame = new JFrame("Parse Tree Viewer");
        Box panel = Box.createHorizontalBox();
        JScrollPane scrollPane = new JScrollPane(panel);

        Box pane;
        JLabel title;
        TreeViewer viewer;

        for (int i=0; i<parserArr.length; i++) {
            pane = Box.createVerticalBox();
            title = new JLabel(titleArr[i]);
            title.setAlignmentX(Component.CENTER_ALIGNMENT);
            viewer = new TreeViewer(
                    Arrays.asList(parserArr[i].getRuleNames()),
                    treeArr[i]
            );
            pane.add(title);
            pane.add(viewer);
            panel.add(pane);
        }

        frame.add(scrollPane);
        frame.setDefaultCloseOperation(JFrame.EXIT_ON_CLOSE);
        frame.setSize(600,500);
        frame.setVisible(true);
    }


    public Parser getParser(CharStream input, Grammar grammar) {

        Lexer lexer = getLexer(input, grammar);
        TokenStream tokens = new CommonTokenStream(lexer);

        switch (grammar) {
            case C11:   return new CParser(tokens);
            case CPP14: return new CPP14Parser(tokens);
            case Java8: return new Java8Parser(tokens);
            default:    return null; // TODO - create UnsupportedGrammarException
        }
    }

    public Lexer getLexer(CharStream input, Grammar grammar) {
        switch (grammar) {
            case C11:   return new CLexer(input);
            case CPP14: return new CPP14Lexer(input);
            case Java8: return new Java8Lexer(input);
            default:    return null; // TODO - create UnsupportedGrammarException
        }
    }

    public static void main(String ... args) {
        try {
            new ParserTest();
        } catch (IOException e) {
            e.printStackTrace();
        }
    }

}
