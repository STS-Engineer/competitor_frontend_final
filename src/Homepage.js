
import styled from "styled-components";
import Navbar from "./Components/Navbar"
import Intro from "./Components/Intro";
import Feature from "./Components/Feature";

const Homepage  = ()=> {

    const Container = styled.div`
    width:100%;
    overflow:hidden;
    position:relative;
    `
    const Shape = `
    width:100%;
    height:100%;
    position:absolute;
    top:0;
    left:0;
    z-index:-1;
    `;
    
    const IntroShape = styled.div`
    ${Shape};
    background:#ef7807;
    clip-path: polygon(67% 0, 100% 0, 100% 100%, 55% 100%);
    `
    const FutureShape = styled.div`
    ${Shape};
    clip-path: polygon(0 0, 55% 0%, 33% 100%, 0 100%);
    background-color: #046eaf;
    `
 

    
return (<div>
     <Container>

        <Intro />
        <IntroShape />
      </Container>

      <Container>
        <Feature />
        <FutureShape />
      </Container>


</div>);


}
export default Homepage;