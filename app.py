import datetime
import io
import pandas as pd
import plotly.express as px
import plotly.graph_objects as go
import streamlit as st

st.set_page_config(
    page_title="MIRRORS | Executive P&L Dashboard",
    page_icon="💎",
    layout="wide",
    initial_sidebar_state="expanded",
)

INCOME_CATEGORIES = [
    "OnlyFans Payouts (Выплаты платформы)",
    "Платные сообщения (PPV / Chatting)",
    "Чаевые (Tips) & Кастомы",
    "Внешняя реклама / Sponsorships",
]

EXPENSE_CATEGORIES = [
    "Трафик: Reddit & Dating Apps",
    "Трафик: TikTok / Reels / Shorts",
    "Трафик: Twitter / X Promo",
    "Зарплаты: Чаттеры / Операторы",
    "Зарплаты: Тимлиды / Баеры",
    "Выплаты моделям (Model Share %)",
    "Софт: Infloww / CreatorHero / CRM",
    "Инфраструктура: Прокси, Dolphin, SIM",
    "Комиссии: Платежки / Paxum / Вывод",
    "Прочие операционные расходы",
]

MODELS_LIST = [
    "Lolly (Lollysunnery)",
    "Lolly (1lollyhere)",
    "Eva Blush",
    "Lila (angelkiss)",
    "Eva Pinky (Fansly)",
    "Agency Core (Общие)",
]

if "df_finances" not in st.session_state:
    today = datetime.date.today()
    st.session_state.df_finances = pd.DataFrame(
        [
            {
                "Дата": today - datetime.timedelta(days=4),
                "Тип": "Доход",
                "Категория": "OnlyFans Payouts (Выплаты платформы)",
                "Описание": "Выплата Lollysunnery",
                "Сумма": 10150.0,
                "Проект": "Lolly (Lollysunnery)",
            },
            {
                "Дата": today - datetime.timedelta(days=4),
                "Тип": "Расход",
                "Категория": "Выплаты моделям (Model Share %)",
                "Описание": "Доля Lolly 50%",
                "Сумма": 5075.0,
                "Проект": "Lolly (Lollysunnery)",
            },
            {
                "Дата": today - datetime.timedelta(days=3),
                "Тип": "Расход",
                "Категория": "Трафик: Reddit & Dating Apps",
                "Описание": "Закупка аккаунтов Reddit",
                "Сумма": 1450.0,
                "Проект": "Lolly (Lollysunnery)",
            },
            {
                "Дата": today - datetime.timedelta(days=3),
                "Тип": "Доход",
                "Категория": "OnlyFans Payouts (Выплаты платформы)",
                "Описание": "Выплата Eva Blush",
                "Сумма": 4600.0,
                "Проект": "Eva Blush",
            },
            {
                "Дата": today - datetime.timedelta(days=3),
                "Тип": "Расход",
                "Категория": "Выплаты моделям (Model Share %)",
                "Описание": "Доля Eva 50%",
                "Сумма": 2300.0,
                "Проект": "Eva Blush",
            },
            {
                "Дата": today - datetime.timedelta(days=2),
                "Тип": "Расход",
                "Категория": "Зарплаты: Чаттеры / Операторы",
                "Описание": "Аванс чаттерам (Karina, Timur, Paul)",
                "Сумма": 2850.0,
                "Проект": "Agency Core (Общие)",
            },
            {
                "Дата": today - datetime.timedelta(days=1),
                "Тип": "Расход",
                "Категория": "Софт: Infloww / CreatorHero / CRM",
                "Описание": "Infloww Pro + Dolphin Anty",
                "Сумма": 480.0,
                "Проект": "Agency Core (Общие)",
            },
            {
                "Дата": today,
                "Тип": "Доход",
                "Категория": "Платные сообщения (PPV / Chatting)",
                "Описание": "Рассылка PPV",
                "Сумма": 3100.0,
                "Проект": "Lolly (1lollyhere)",
            },
            {
                "Дата": today,
                "Тип": "Расход",
                "Категория": "Комиссии: Платежки / Paxum / Вывод",
                "Описание": "Вывод в USDT",
                "Сумма": 420.0,
                "Проект": "Agency Core (Общие)",
            },
        ]
    )

if "budgets" not in st.session_state:
    st.session_state.budgets = {
        "Трафик и Маркетинг": 8500.0,
        "Зарплаты (Чаттеры + Баеры)": 6000.0,
        "Софт и Инфраструктура": 1200.0,
        "Комиссии и Обнал": 900.0,
        "Выплаты Моделям": 18000.0,
    }

df = st.session_state.df_finances.copy()
df["Дата"] = pd.to_datetime(df["Дата"]).dt.date
df["Сумма"] = pd.to_numeric(df["Сумма"], errors="coerce").fillna(0.0)

with st.sidebar:
    st.title("💎 MIRRORS HQ")
    st.caption("P&L & Чистая Прибыль Агентства")

    with st.expander("➕ Новая операция", expanded=False):
        with st.form("add_op"):
            op_d = st.date_input("Дата", datetime.date.today())
            op_t = st.radio("Тип", ["Расход", "Доход"], horizontal=True)
            op_c = st.selectbox(
                "Категория",
                INCOME_CATEGORIES if op_t == "Доход" else EXPENSE_CATEGORIES,
            )
            op_a = st.number_input("Сумма ($)", min_value=1.0, step=100.0)
            op_m = st.selectbox("Модель", MODELS_LIST)
            op_desc = st.text_input("Комментарий")
            if st.form_submit_button("Записать в P&L"):
                new_row = pd.DataFrame(
                    [
                        {
                            "Дата": op_d,
                            "Тип": op_t,
                            "Категория": op_c,
                            "Описание": op_desc,
                            "Сумма": op_a,
                            "Проект": op_m,
                        }
                    ]
                )
                st.session_state.df_finances = pd.concat(
                    [st.session_state.df_finances, new_row], ignore_index=True
                )
                st.success("Добавлено!")
                st.rerun()

    st.markdown("---")
    selected_model = st.selectbox("Фильтр модели", ["Все"] + MODELS_LIST)

if selected_model != "Все":
    df = df[df["Проект"] == selected_model]

# KPI Calculations
income = df[df["Тип"] == "Доход"]["Сумма"].sum()
expense = df[df["Тип"] == "Расход"]["Сумма"].sum()
net = income - expense
margin = (net / income * 100) if income > 0 else 0.0
traffic = df[
    (df["Тип"] == "Расход") & (df["Категория"].str.startswith("Трафик"))
]["Сумма"].sum()
roas = (income / traffic) if traffic > 0 else 0.0

st.title("💰 MIRRORS — P&L & Чистая Прибыль")

c1, c2, c3, c4, c5 = st.columns(5)
c1.metric("💵 Общий Доход", f"${income:,.2f}")
c2.metric("💸 Общие Расходы", f"${expense:,.2f}")
c3.metric(
    "🏆 Чистая Прибыль",
    f"${net:,.2f}",
    delta=f"{margin:.1f}% маржа",
    delta_color="normal" if net >= 0 else "inverse",
)
c4.metric("📊 Маржинальность", f"{margin:.1f}%")
c5.metric("🎯 ROAS (Трафик)", f"{roas:.2f}x")

st.markdown("---")

tab1, tab2, tab3 = st.tabs(
    ["🎯 Планы по тратам (План vs Факт)", "📈 Графики", "📋 Реестр & Экспорт"]
)

with tab1:
    st.subheader("Контроль лимитов расходов")
    actual_traffic = df[
        (df["Тип"] == "Расход") & (df["Категория"].str.startswith("Трафик"))
    ]["Сумма"].sum()
    actual_salaries = df[
        (df["Тип"] == "Расход") & (df["Категория"].str.startswith("Зарплаты"))
    ]["Сумма"].sum()
    actual_tech = df[
        (df["Тип"] == "Расход")
        & (
            df["Категория"].str.contains("Софт")
            | df["Категория"].str.contains("Инфраструктура")
        )
    ]["Сумма"].sum()
    actual_comm = df[
        (df["Тип"] == "Расход") & (df["Категория"].str.contains("Комиссии"))
    ]["Сумма"].sum()
    actual_models = df[
        (df["Тип"] == "Расход")
        & (df["Категория"].str.contains("Выплаты моделям"))
    ]["Сумма"].sum()

    act_map = {
        "Трафик и Маркетинг": actual_traffic,
        "Зарплаты (Чаттеры + Баеры)": actual_salaries,
        "Софт и Инфраструктура": actual_tech,
        "Комиссии и Обнал": actual_comm,
        "Выплаты Моделям": actual_models,
    }

    for cat, plan in st.session_state.budgets.items():
        fact = act_map.get(cat, 0.0)
        rem = plan - fact
        pct = (fact / plan * 100) if plan > 0 else 0.0

        col_a, col_b, col_c = st.columns([4, 4, 2])
        col_a.markdown(f"**{cat}**")
        col_b.markdown(
            f"План: **${plan:,.0f}** | Факт: **${fact:,.0f}** | Остаток: **${rem:,.0f}**"
        )
        col_c.markdown(f"**{pct:.1f}%**")
        st.progress(min(fact / plan, 1.0) if plan > 0 else 0.0)

with tab2:
    g1, g2 = st.columns(2)
    with g1:
        st.subheader("Динамика доходов и расходов")
        fig = px.bar(
            df,
            x="Дата",
            y="Сумма",
            color="Тип",
            barmode="group",
            color_discrete_map={"Доход": "#10B981", "Расход": "#EF4444"},
        )
        st.plotly_chart(fig, use_container_width=True)
    with g2:
        st.subheader("Структура расходов")
        exp_df = df[df["Тип"] == "Расход"]
        if not exp_df.empty:
            fig_p = px.pie(
                exp_df,
                names="Категория",
                values="Сумма",
                hole=0.4,
                color_discrete_sequence=px.colors.qualitative.Pastel,
            )
            st.plotly_chart(fig_p, use_container_width=True)

with tab3:
    st.subheader("Реестр транзакций")
    buffer = io.BytesIO()
    with pd.ExcelWriter(buffer, engine="openpyxl") as writer:
        df.to_excel(writer, index=False, sheet_name="Transactions")
    st.download_button(
        "📥 Скачать Excel (.xlsx)",
        data=buffer.getvalue(),
        file_name="MIRRORS_Finance.xlsx",
        mime="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    )
    st.dataframe(df, use_container_width=True)
