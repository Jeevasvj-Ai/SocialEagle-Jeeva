import streamlit as JB

JB.set_page_config(page_title="HR Role System", page_icon="👔")

# Initialize session state safely
if "name" not in JB.session_state:
    JB.session_state.name = ""

if "experience" not in JB.session_state:
    JB.session_state.experience = "Select"


JB.title("👔 HR Role Assignment System")
JB.write("Enter your details to know your role in the organization.")


# Role logic
def get_role(exp):
    if exp == "Less than 5 years":
        return "Engineer"
    elif exp == "5 - 8 years":
        return "Team Lead"
    elif exp == "10 - 12 years":
        return "Manager"
    elif exp == "Above 15 years":
        return "VP"
    return None


# Inputs
JB.text_input("Enter your name", key="name")

JB.selectbox(
    "Select your years of experience",
    [
        "Select",
        "Less than 5 years",
        "5 - 8 years",
        "10 - 12 years",
        "Above 15 years"
    ],
    key="experience"
)


# Get Role button
if JB.button("Get My Role"):

    if JB.session_state.name.strip() == "":
        JB.error("⚠️ Please enter your name to proceed.")

    elif JB.session_state.experience == "Select":
        JB.warning("⚠️ Please select your experience level.")

    else:
        role = get_role(JB.session_state.experience)
        JB.success(f"Hello {JB.session_state.name}! 🎉")
        JB.info(f"Your assigned role is: **{role}**")


